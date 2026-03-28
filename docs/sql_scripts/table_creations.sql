create table public.users (
    id uuid not null default gen_random_uuid (),
    sub text not null,
    created_at timestamp with time zone not null default now(),
    constraint users_pkey primary key (id),
    constraint users_sub_key unique (sub)
) TABLESPACE pg_default;

create table public.chat_sessions (
    id uuid primary key default gen_random_uuid(),
    sub text not null,
    created_at timestamptz default now(),

    constraint chat_sessions_user_fk
    foreign key (sub)
    references users(sub)
    on delete cascade
);

create table public.chat_messages (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null,
    role text not null check (role in ('user','assistant','system')),
    content text not null,
    message_type text default 'text' check (message_type in ('text','audio','image')),
    audio_url text,
    audio_duration integer,
    model text,
    created_at timestamptz default now(),

    constraint chat_messages_session_fk
    foreign key (session_id)
    references chat_sessions(id)
    on delete cascade
);

create table public.chat_completion_usage (
    id uuid primary key default gen_random_uuid(),
    message_id uuid not null,
    openrouter_id text,
    provider text,
    prompt_tokens integer,
    completion_tokens integer,
    total_tokens integer,
    cost numeric(18, 10),
    created_at timestamptz default now(),

    constraint chat_completion_usage_message_fk
    foreign key (message_id)
    references chat_messages(id)
    on delete cascade
);

create table public.journals (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null,
    sub text not null,
    content text not null,
    created_at timestamptz default now(),

    constraint journals_session_fk
    foreign key (session_id)
    references chat_sessions(id)
    on delete cascade,

    constraint journals_user_fk
    foreign key (sub)
    references users(sub)
    on delete cascade
);