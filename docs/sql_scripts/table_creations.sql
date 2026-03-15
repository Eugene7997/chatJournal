create table public.users (
    id uuid not null default gen_random_uuid (),
    sub text not null,
    created_at timestamp with time zone not null default now(),
    constraint users_pkey primary key (id),
    constraint users_sub_key unique (sub)
) TABLESPACE pg_default;

create table public.chat_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    created_at timestamptz default now(),

    constraint chat_sessions_user_fk
    foreign key (user_id)
    references users(id)
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