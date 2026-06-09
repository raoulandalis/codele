create table daily_puzzles (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  answer char(5) not null check (answer ~ '^[1-9][0-9]{4}$'),
  created_at timestamptz default now()
);

create table daily_analytics (
  date date primary key,
  puzzle_id uuid not null references daily_puzzles(id),
  games_played int not null default 0,
  games_won int not null default 0,
  games_lost int not null default 0,
  total_guesses int not null default 0,
  guess_distribution jsonb not null default '{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0}',
  updated_at timestamptz default now()
);

-- Atomic increment for concurrent game completions
create or replace function record_daily_result(
  p_date date,
  p_puzzle_id uuid,
  p_won boolean,
  p_guess_count int
) returns void as $$
declare
  dist jsonb;
  key text;
begin
  insert into daily_analytics (date, puzzle_id)
  values (p_date, p_puzzle_id)
  on conflict (date) do nothing;

  if p_won then
    select guess_distribution into dist from daily_analytics where date = p_date;
    key := p_guess_count::text;
    dist := jsonb_set(
      dist,
      array[key],
      to_jsonb((coalesce((dist->>key)::int, 0) + 1))
    );

    update daily_analytics
    set
      games_played = games_played + 1,
      games_won = games_won + 1,
      total_guesses = total_guesses + p_guess_count,
      guess_distribution = dist,
      updated_at = now()
    where date = p_date;
  else
    update daily_analytics
    set
      games_played = games_played + 1,
      games_lost = games_lost + 1,
      total_guesses = total_guesses + p_guess_count,
      updated_at = now()
    where date = p_date;
  end if;
end;
$$ language plpgsql;
