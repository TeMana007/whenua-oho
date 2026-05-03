-- ============================================================
-- Auto-create a learner row when a new auth user signs up.
-- Reads name and class_code from auth.users.raw_user_meta_data.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.learners (id, name, email, level, class_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'beginner',
    nullif(trim(new.raw_user_meta_data->>'class_code'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
