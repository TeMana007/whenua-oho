-- ============================================================
-- Auto-create a learner row when a new auth user signs up.
-- Reads name from auth.users.raw_user_meta_data.
-- Aligned to new schema: user_id (not id), no email col, no class_code col.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_class_id uuid := null;
  v_class_code text;
begin
  -- Resolve class_code → class_id if provided in user metadata
  v_class_code := nullif(trim(new.raw_user_meta_data->>'class_code'), '');

  if v_class_code is not null then
    select id into v_class_id
    from public.classes
    where class_code = upper(v_class_code)
    limit 1;
  end if;

  insert into public.learners (user_id, name, level, class_id)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      split_part(new.email, '@', 1)
    ),
    'beginner',
    v_class_id
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Drop and recreate trigger so it always points to the updated function
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
