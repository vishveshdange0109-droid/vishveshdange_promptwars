-- THINK TWICE Schema Definition
-- Run this in the Supabase SQL Editor

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  status text default 'active',          -- active | completed
  strike_count int default 0,
  question_count int default 0,
  created_at timestamptz default now()
);

create table if not exists situations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  raw_input text not null,
  decision_statement text not null,
  domain text,
  options jsonb default '[]'::jsonb,
  key_entities jsonb default '[]'::jsonb,
  in_scope_topics jsonb default '[]'::jsonb,
  confirmed boolean default false,
  decision_state jsonb default '{}'::jsonb,   -- updated every turn
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  role text not null,                     -- user | assistant | system_note
  content text not null,
  scope_label text,                       -- ANSWER | NEW_RELEVANT_INFO | OFF_TOPIC
  created_at timestamptz default now()
);

-- Indexing for fast lookups
create index if not exists idx_situations_session on situations(session_id);
create index if not exists idx_messages_session on messages(session_id);
