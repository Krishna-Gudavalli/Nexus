create table if not exists users(id uuid primary key,email text unique not null,role text not null,created_at timestamptz default now());
create table if not exists agents(id text primary key,name text not null,description text,system_prompt text not null,tools jsonb not null,status text not null,created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists runs(id text primary key,agent_id text,task text not null,status text not null,answer text,duration_ms integer,created_at timestamptz default now(),steps jsonb not null);
create table if not exists memories(id uuid primary key,agent_id text,content text not null,tags jsonb not null,importance real not null,embedding jsonb,created_at timestamptz default now());
create table if not exists workflows(id uuid primary key,name text not null,description text,nodes jsonb not null,enabled boolean default false,created_at timestamptz default now());
create table if not exists eval_results(id uuid primary key,case_id text,score integer,passed boolean,output text,latency_ms integer,created_at timestamptz default now());
