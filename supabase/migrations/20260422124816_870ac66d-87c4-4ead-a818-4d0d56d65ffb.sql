
-- 1) Очистка всех пользователей и связанных данных
-- Удаление из auth.users каскадно очистит зависимые таблицы благодаря ON DELETE CASCADE
-- Сначала вручную очистим публичные таблицы, не имеющие FK на auth.users
TRUNCATE TABLE 
  public.ai_messages,
  public.ai_conversations,
  public.action_events,
  public.client_notes,
  public.clients,
  public.daily_tasks,
  public.deal_stages,
  public.fortune_wheel_spins,
  public.invites,
  public.invoices,
  public.manager_group_members,
  public.manager_groups,
  public.manager_kpi,
  public.mystery_boxes,
  public.notifications,
  public.one_on_one_notes,
  public.penalties,
  public.profiles,
  public.reminders,
  public.user_achievements,
  public.user_boosts,
  public.user_roles,
  public.user_settings,
  public.audit_log,
  public.automation_rules,
  public.team_plan
RESTART IDENTITY CASCADE;

-- Удаление всех пользователей из auth схемы
DELETE FROM auth.users;

-- 2) Обновление триггера: первый зарегистрированный = leader, остальные = manager
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_count integer;
  assigned_role public.app_role;
BEGIN
  -- Создаём профиль и настройки
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);

  -- Считаем существующие роли (не считая только что созданного пользователя)
  SELECT COUNT(*) INTO user_count FROM public.user_roles;

  IF user_count = 0 THEN
    assigned_role := 'leader';
  ELSE
    assigned_role := 'manager';
  END IF;

  -- Назначаем роль, только если она ещё не назначена (например, signUpAsLeader или invite)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 3) Убедимся, что триггер привязан к auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
