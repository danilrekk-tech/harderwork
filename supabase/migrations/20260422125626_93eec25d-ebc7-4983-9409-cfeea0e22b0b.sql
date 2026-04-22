-- Уникальные ограничения для защиты от дубликатов
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique ON public.profiles(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS user_settings_user_id_unique ON public.user_settings(user_id);

-- Идемпотентный триггер
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  role_count integer;
  assigned_role public.app_role;
BEGIN
  -- Профиль (без дубликатов)
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email))
  ON CONFLICT (user_id) DO NOTHING;

  -- Настройки (без дубликатов)
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Если у пользователя уже есть роль - ничего не делаем
  SELECT COUNT(*) INTO role_count FROM public.user_roles WHERE user_id = NEW.id;
  IF role_count > 0 THEN
    RETURN NEW;
  END IF;

  -- Глобально: если ролей нет — первый становится leader
  SELECT COUNT(*) INTO role_count FROM public.user_roles;
  IF role_count = 0 THEN
    assigned_role := 'leader';
  ELSE
    assigned_role := 'manager';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- Убедимся, что триггер существует
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();