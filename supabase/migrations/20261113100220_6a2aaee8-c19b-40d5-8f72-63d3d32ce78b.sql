-- Concern: signup trigger also saves full name and terms/privacy acceptance from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _full_name text := nullif(left(btrim(coalesce(NEW.raw_user_meta_data->>'full_name', '')), 80), '');
  _terms_accepted boolean := coalesce(NEW.raw_user_meta_data->>'terms_accepted', '') = 'true';
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.private_profiles (id, full_name, terms_accepted_at, privacy_accepted_at)
  VALUES (
    NEW.id,
    _full_name,
    CASE WHEN _terms_accepted THEN now() END,
    CASE WHEN _terms_accepted THEN now() END
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;