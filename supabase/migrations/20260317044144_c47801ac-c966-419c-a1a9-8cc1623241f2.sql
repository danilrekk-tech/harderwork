
-- Enum for roles
CREATE TYPE public.app_role AS ENUM ('leader', 'manager');
CREATE TYPE public.deal_status AS ENUM ('processed', 'invoice_sent', 'invoice_paid');
CREATE TYPE public.invoice_status AS ENUM ('issued', 'paid');

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  total_xp_earned INTEGER NOT NULL DEFAULT 0,
  xp_spent INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT NOT NULL DEFAULT '',
  processed_clients_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  product TEXT NOT NULL DEFAULT '',
  deal_status deal_status NOT NULL DEFAULT 'processed',
  invoice_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'issued',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Reminders
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_timezone TEXT NOT NULL DEFAULT 'UTC',
  client_time TEXT NOT NULL DEFAULT '',
  my_time TEXT NOT NULL DEFAULT '',
  reason TEXT NOT NULL DEFAULT '',
  amount NUMERIC,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Action events
CREATE TABLE public.action_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  xp_earned INTEGER NOT NULL DEFAULT 0,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  manager_name TEXT
);
ALTER TABLE public.action_events ENABLE ROW LEVEL SECURITY;

-- Achievements
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '🏆',
  xp_reward INTEGER NOT NULL DEFAULT 0,
  condition_type TEXT NOT NULL,
  condition_target INTEGER NOT NULL DEFAULT 0,
  collection_id TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- User achievements
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Contests
CREATE TABLE public.contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'individual',
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  prize TEXT NOT NULL DEFAULT '',
  prize_xp INTEGER NOT NULL DEFAULT 0,
  metric TEXT NOT NULL DEFAULT 'revenue',
  target INTEGER NOT NULL DEFAULT 0,
  teams JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;

-- Bonus activities
CREATE TABLE public.bonus_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  period TEXT NOT NULL DEFAULT 'daily',
  prize TEXT NOT NULL DEFAULT '',
  xp_reward INTEGER NOT NULL DEFAULT 0,
  metric TEXT NOT NULL DEFAULT 'revenue',
  target INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bonus_activities ENABLE ROW LEVEL SECURITY;

-- Boost items
CREATE TABLE public.boost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '⚡',
  xp_cost INTEGER NOT NULL DEFAULT 0,
  effect TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.boost_items ENABLE ROW LEVEL SECURITY;

-- User boosts
CREATE TABLE public.user_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  boost_id UUID NOT NULL REFERENCES public.boost_items(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_boosts ENABLE ROW LEVEL SECURITY;

-- User settings
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'count',
  plan_target INTEGER NOT NULL DEFAULT 20,
  multi_level_plan JSONB NOT NULL DEFAULT '{"invoices":{"min":10,"norm":15,"challenge":20},"payments":{"min":5,"norm":10,"challenge":15}}',
  work_days JSONB NOT NULL DEFAULT '[1,2,3,4,5]',
  start_time TEXT NOT NULL DEFAULT '09:00',
  end_time TEXT NOT NULL DEFAULT '18:00',
  timezone TEXT NOT NULL DEFAULT 'Europe/Moscow',
  dashboard_widgets JSONB NOT NULL DEFAULT '[]',
  skills JSONB NOT NULL DEFAULT '{"closing":0,"processing":0,"planning":0,"availablePoints":0}',
  momentum JSONB NOT NULL DEFAULT '{"value":0}',
  combo JSONB NOT NULL DEFAULT '{"count":0,"maxCombo":0}',
  personal_records JSONB NOT NULL DEFAULT '{"maxInvoicesPerDay":{"value":0},"maxPaymentsPerDay":{"value":0},"maxClientsPerDay":{"value":0},"maxRevenuePerDay":{"value":0}}',
  focus_session JSONB NOT NULL DEFAULT '{"isActive":false,"durationMinutes":25,"actionsCount":0,"bonusXpPercent":20}',
  plan_completed_this_month BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Daily tasks
CREATE TABLE public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  target INTEGER NOT NULL DEFAULT 0,
  current INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- Invites
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Seasons
CREATE TABLE public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

-- Achievement collections
CREATE TABLE public.achievement_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📦',
  bonus_xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.achievement_collections ENABLE ROW LEVEL SECURITY;

-- ========== RLS POLICIES ==========

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Leaders can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'leader'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Leaders can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'leader'));
CREATE POLICY "Leaders can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'leader'));

CREATE POLICY "Users can manage own clients" ON public.clients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Leaders can view all clients" ON public.clients FOR SELECT USING (public.has_role(auth.uid(), 'leader'));

CREATE POLICY "Users can manage own invoices" ON public.invoices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Leaders can view all invoices" ON public.invoices FOR SELECT USING (public.has_role(auth.uid(), 'leader'));

CREATE POLICY "Users can manage own reminders" ON public.reminders FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own events" ON public.action_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Leaders can view all events" ON public.action_events FOR SELECT USING (public.has_role(auth.uid(), 'leader'));

CREATE POLICY "Achievements viewable by all" ON public.achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leaders can manage achievements" ON public.achievements FOR ALL USING (public.has_role(auth.uid(), 'leader'));

CREATE POLICY "Users can view own user_achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user_achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Leaders can view all user_achievements" ON public.user_achievements FOR SELECT USING (public.has_role(auth.uid(), 'leader'));

CREATE POLICY "Contests viewable by all" ON public.contests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leaders can manage contests" ON public.contests FOR ALL USING (public.has_role(auth.uid(), 'leader'));

CREATE POLICY "Activities viewable by all" ON public.bonus_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leaders can manage activities" ON public.bonus_activities FOR ALL USING (public.has_role(auth.uid(), 'leader'));

CREATE POLICY "Boosts viewable by all" ON public.boost_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leaders can manage boosts" ON public.boost_items FOR ALL USING (public.has_role(auth.uid(), 'leader'));

CREATE POLICY "Users can manage own boosts" ON public.user_boosts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tasks" ON public.daily_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Leaders can view all tasks" ON public.daily_tasks FOR SELECT USING (public.has_role(auth.uid(), 'leader'));

CREATE POLICY "Leaders can manage invites" ON public.invites FOR ALL USING (public.has_role(auth.uid(), 'leader'));
CREATE POLICY "Anyone can read valid invites" ON public.invites FOR SELECT TO anon USING (used_by IS NULL AND expires_at > now());

CREATE POLICY "Seasons viewable by all" ON public.seasons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leaders can manage seasons" ON public.seasons FOR ALL USING (public.has_role(auth.uid(), 'leader'));

CREATE POLICY "Collections viewable by all" ON public.achievement_collections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leaders can manage collections" ON public.achievement_collections FOR ALL USING (public.has_role(auth.uid(), 'leader'));

-- Triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Validate invite and assign manager role
CREATE OR REPLACE FUNCTION public.use_invite(_code TEXT, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.invites SET used_by = _user_id, used_at = now()
  WHERE code = _code AND used_by IS NULL AND expires_at > now();
  IF FOUND THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'manager') ON CONFLICT DO NOTHING;
    RETURN true;
  END IF;
  RETURN false;
END;
$$;
