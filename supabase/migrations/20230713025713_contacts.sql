create extension if not exists "uuid-ossp";

-- make the thing
create table public.contacts(
    id uuid unique default uuid_generate_v4(),
    email text,
    name text,
    company text,
    phone text,
    user_id uuid references auth.users(id) on delete cascade not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    primary key (id)
);

-- secure the thing
alter table public.contacts enable row level security;

-- now R/U/D the thing; Creates managed from app since it's subscription limited
create policy "Users can view own contacts" on contacts
    for select to authenticated
        using (auth.uid() = user_id);

create policy "Users can update own contacts" on contacts
    for update to authenticated
        using (auth.uid() = user_id);

create policy "Users can delete own contacts" on contacts
    for delete to authenticated
        using (auth.uid() = user_id);

