-- Challenge Arena admin setup
-- Run this once in Supabase SQL Editor.
-- IMPORTANT: replace YOUR_AUTH_USER_UUID with the UUID of your own Challenge Arena account.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

revoke all on public.admin_users from anon, authenticated;

drop policy if exists "admins can view own admin record" on public.admin_users;
create policy "admins can view own admin record"
on public.admin_users for select
to authenticated
using (user_id = auth.uid());

insert into public.admin_users(user_id, role)
values ('YOUR_AUTH_USER_UUID', 'admin')
on conflict (user_id) do update set role='admin';

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.admin_dashboard()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare result jsonb;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'attempts', (select count(*) from public.game_attempts),
    'points', coalesce((select sum(score) from public.game_attempts),0),
    'today_attempts', (select count(*) from public.game_attempts where created_at >= current_date),
    'active_questions', (select count(*) from public.challenge_questions where active=true),
    'latest_users', coalesce((select jsonb_agg(x) from (
      select p.display_name, p.updated_at from public.profiles p order by p.updated_at desc nulls last limit 10
    ) x),'[]'::jsonb)
  ) into result;
  return result;
end;
$$;

revoke all on function public.admin_dashboard() from public;
grant execute on function public.admin_dashboard() to authenticated;

create or replace function public.admin_toggle_question(question_id bigint, enabled boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  update public.challenge_questions set active=enabled where id=question_id;
  return found;
end;
$$;

revoke all on function public.admin_toggle_question(bigint, boolean) from public;
grant execute on function public.admin_toggle_question(bigint, boolean) to authenticated;
