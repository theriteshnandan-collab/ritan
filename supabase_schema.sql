-- Enable Row Level Security
create table usage_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  request_count int default 0,
  last_request_at timestamp with time zone default now(),
  tier text default 'free',
  created_at timestamp with time zone default now()
);

alter table usage_metrics enable row level security;

-- Allow users to read their own usage
create policy "Users can view their own usage" 
on usage_metrics for select 
using (auth.uid() = user_id);

-- Allow server (service_role) to update usage
create policy "Service role can update usage" 
on usage_metrics for all 
using (true) 
with check (true);

-- Function to handle new user signup (auto-create usage row)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.usage_metrics (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function on new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
