create extension if not exists "pgcrypto";

create type public.subscription_status as enum ('free', 'premium_monthly', 'premium_yearly', 'blocked');
create type public.task_status as enum ('pendente', 'em_andamento', 'concluido', 'cancelado');
create type public.priority_level as enum ('baixa', 'media', 'alta', 'urgente');
create type public.finance_type as enum ('entrada', 'saida', 'investimento');
create type public.finance_status as enum ('previsto', 'pago', 'atrasado');
create type public.goal_horizon as enum ('curto', 'medio', 'longo');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id uuid generated always as (id) stored,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'super_admin')),
  subscription_status public.subscription_status not null default 'free',
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  client text,
  company text,
  scheduled_date date not null,
  scheduled_time time,
  priority public.priority_level not null default 'media',
  status public.task_status not null default 'pendente',
  notes text,
  recurrence text,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.study_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  item_type text not null check (item_type in ('trabalho', 'prova', 'aula', 'seminario', 'atividade', 'entrega', 'revisao')),
  title text not null,
  scheduled_date date not null,
  scheduled_time time,
  priority public.priority_level not null default 'media',
  notes text,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.internship_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  company text not null,
  supervisor text,
  scheduled_date date not null,
  start_time time not null,
  end_time time,
  priority public.priority_level not null default 'media',
  status public.task_status not null default 'pendente',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.study_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  discipline text not null,
  chapter text,
  title text not null,
  content text not null,
  summary text,
  keywords text[] not null default '{}',
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.study_flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid references public.study_notes(id) on delete cascade,
  front text not null,
  back text not null,
  difficulty text not null default 'medio' check (difficulty in ('facil', 'medio', 'dificil')),
  due_at timestamptz not null default now(),
  interval_days integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.study_quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid references public.study_notes(id) on delete set null,
  quiz_type text not null check (quiz_type in ('multipla_escolha', 'discursiva', 'simulado', 'pergunta_resposta')),
  question text not null,
  options jsonb not null default '[]'::jsonb,
  answer text not null,
  score numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.meal_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_type text not null check (meal_type in ('cafe', 'almoco', 'lanche', 'jantar', 'ceia', 'agua', 'suplemento')),
  scheduled_time time not null,
  amount text,
  notes text,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.finance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  record_type public.finance_type not null,
  title text not null,
  amount numeric(12,2) not null check (amount >= 0),
  record_date date not null,
  category text not null,
  status public.finance_status not null default 'previsto',
  payment_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  horizon public.goal_horizon not null,
  progress integer not null default 0 check (progress between 0 and 100),
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  enabled boolean not null default true,
  sound boolean not null default true,
  meal_lead_time_minutes integer not null default 2 check (meal_lead_time_minutes in (2, 5, 10, 15)),
  study_lead_time_minutes integer not null default 30 check (study_lead_time_minutes in (15, 30, 60, 1440)),
  internship_lead_time_minutes integer not null default 15 check (internship_lead_time_minutes in (5, 15, 30, 60)),
  finance_lead_time_minutes integer not null default 1440 check (finance_lead_time_minutes in (60, 1440, 4320)),
  task_daily_hour time not null default '08:00',
  push_subscription jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_name text not null,
  metric_value numeric not null,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.tasks (user_id, scheduled_date);
create index on public.study_reminders (user_id, scheduled_date);
create index on public.internship_reminders (user_id, scheduled_date);
create index on public.study_notes (user_id, subject);
create index on public.finance_records (user_id, record_date);
create index on public.goals (user_id, deadline);
create index on public.activity_logs (user_id, created_at desc);

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
create trigger study_reminders_updated_at before update on public.study_reminders for each row execute function public.set_updated_at();
create trigger internship_reminders_updated_at before update on public.internship_reminders for each row execute function public.set_updated_at();
create trigger study_notes_updated_at before update on public.study_notes for each row execute function public.set_updated_at();
create trigger study_flashcards_updated_at before update on public.study_flashcards for each row execute function public.set_updated_at();
create trigger study_quizzes_updated_at before update on public.study_quizzes for each row execute function public.set_updated_at();
create trigger meal_reminders_updated_at before update on public.meal_reminders for each row execute function public.set_updated_at();
create trigger finance_records_updated_at before update on public.finance_records for each row execute function public.set_updated_at();
create trigger goals_updated_at before update on public.goals for each row execute function public.set_updated_at();
create trigger notification_settings_updated_at before update on public.notification_settings for each row execute function public.set_updated_at();
create trigger activity_logs_updated_at before update on public.activity_logs for each row execute function public.set_updated_at();
create trigger admin_metrics_updated_at before update on public.admin_metrics for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.study_reminders enable row level security;
alter table public.internship_reminders enable row level security;
alter table public.study_notes enable row level security;
alter table public.study_flashcards enable row level security;
alter table public.study_quizzes enable row level security;
alter table public.meal_reminders enable row level security;
alter table public.finance_records enable row level security;
alter table public.goals enable row level security;
alter table public.notification_settings enable row level security;
alter table public.activity_logs enable row level security;
alter table public.admin_metrics enable row level security;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'super_admin'
      and is_blocked = false
  );
$$;

create or replace function public.can_access_app()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_blocked = false
  );
$$;

create policy "profiles_select_own" on public.profiles for select using (id = auth.uid() or public.is_super_admin());
create policy "profiles_insert_own" on public.profiles for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (
  id = auth.uid()
  and role = 'user'
  and subscription_status = 'free'
  and is_blocked = false
);
create policy "profiles_update_admin" on public.profiles for update using (public.is_super_admin()) with check (public.is_super_admin());
create policy "profiles_delete_own" on public.profiles for delete using (id = auth.uid());

revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url, updated_at) on public.profiles to authenticated;

create policy "admin_metrics_select_admin" on public.admin_metrics for select using (public.is_super_admin());
create policy "admin_metrics_insert_admin" on public.admin_metrics for insert with check (public.is_super_admin());
create policy "admin_metrics_update_admin" on public.admin_metrics for update using (public.is_super_admin()) with check (public.is_super_admin());
create policy "admin_metrics_delete_admin" on public.admin_metrics for delete using (public.is_super_admin());

create or replace function public.create_owner_policies(table_name text)
returns void
language plpgsql
as $$
begin
  execute format('create policy %I on public.%I for select using (user_id = auth.uid() and public.can_access_app())', table_name || '_select_own', table_name);
  execute format('create policy %I on public.%I for insert with check (user_id = auth.uid() and public.can_access_app())', table_name || '_insert_own', table_name);
  execute format('create policy %I on public.%I for update using (user_id = auth.uid() and public.can_access_app()) with check (user_id = auth.uid() and public.can_access_app())', table_name || '_update_own', table_name);
  execute format('create policy %I on public.%I for delete using (user_id = auth.uid() and public.can_access_app())', table_name || '_delete_own', table_name);
end;
$$;

select public.create_owner_policies('tasks');
select public.create_owner_policies('study_reminders');
select public.create_owner_policies('internship_reminders');
select public.create_owner_policies('study_notes');
select public.create_owner_policies('study_flashcards');
select public.create_owner_policies('study_quizzes');
select public.create_owner_policies('meal_reminders');
select public.create_owner_policies('finance_records');
select public.create_owner_policies('goals');
select public.create_owner_policies('notification_settings');
select public.create_owner_policies('activity_logs');

drop function public.create_owner_policies(text);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));

  insert into public.notification_settings (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.log_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.activity_logs (user_id, action, entity, entity_id)
  values (coalesce(new.user_id, old.user_id), tg_op, tg_table_name, coalesce(new.id, old.id));
  return coalesce(new, old);
end;
$$;

create trigger audit_tasks after insert or update or delete on public.tasks for each row execute function public.log_activity();
create trigger audit_internship_reminders after insert or update or delete on public.internship_reminders for each row execute function public.log_activity();
create trigger audit_study_notes after insert or update or delete on public.study_notes for each row execute function public.log_activity();
create trigger audit_finance_records after insert or update or delete on public.finance_records for each row execute function public.log_activity();
