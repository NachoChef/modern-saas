create table public.profiles(
    id uuid unique references auth.users on delete cascade,
    full_name text,
    updated_at timestamp with time zone default now() not null,
    created_at timestamp with time zone default now() not null,
    primary key (id)
);

-- lock down everything for everyone
alter table public.profiles enable row level security;

-- now add access for authenticated users for their own profiles
-- not public profiles, so auth required
create policy "Users can view own profile" on profiles
    for select to authenticated
    -- using (true); public to other signed-in users
        using (auth.uid() = id);

-- for select
--     using (true); public to everyone
create policy "Users can update own profile" on profiles
    for update to authenticated
        using (auth.uid() = id);

create or replace function public.handle_new_user()
    returns trigger
    as $$
begin
    insert into public.profiles(id, full_name)
        values(new.id, new.raw_user_meta_data ->> 'full_name');
    return new;
end;
$$
language plpgsql
security definer;

create trigger on_auth_user_created
    after insert on auth.users for each row
    execute procedure public.handle_new_user();

