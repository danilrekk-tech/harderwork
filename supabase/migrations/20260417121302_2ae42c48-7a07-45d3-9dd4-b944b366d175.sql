-- 1. AUDIT LOG
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  actor_name TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leaders can view audit log" ON public.audit_log FOR SELECT USING (has_role(auth.uid(), 'leader'));
CREATE POLICY "Authenticated can insert audit" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);

-- 2. APP SETTINGS
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings viewable by all" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leaders can manage settings" ON public.app_settings FOR ALL USING (has_role(auth.uid(), 'leader'));

INSERT INTO public.app_settings (key, value) VALUES
  ('company', '{"name": "MegaGroup Team", "logo_url": null, "primary_color": "#16a918"}'::jsonb),
  ('limits', '{"max_managers": 100, "max_invites_per_day": 20}'::jsonb);

-- 3. NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Leaders can create notifications" ON public.notifications FOR INSERT WITH CHECK (has_role(auth.uid(), 'leader'));
CREATE INDEX idx_notif_user_unread ON public.notifications(user_id, read_at);

-- 4. AUTOMATION RULES
CREATE TABLE public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_type TEXT NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leaders manage automation" ON public.automation_rules FOR ALL USING (has_role(auth.uid(), 'leader'));

-- 5. AI CONVERSATIONS
CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Новый диалог',
  context_type TEXT NOT NULL DEFAULT 'sales',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai convos" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai messages" ON public.ai_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.ai_conversations WHERE id = conversation_id AND user_id = auth.uid())
);

-- 6. DEAL STAGES + extend clients
CREATE TABLE public.deal_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#16a918',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deal_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own stages" ON public.deal_stages FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stage_id UUID REFERENCES public.deal_stages(id) ON DELETE SET NULL;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS temperature TEXT DEFAULT 'warm';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS expected_close_date DATE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 7. CLIENT NOTES
CREATE TABLE public.client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own client notes" ON public.client_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Leaders view all client notes" ON public.client_notes FOR SELECT USING (has_role(auth.uid(), 'leader'));

-- 8. MANAGER GROUPS
CREATE TABLE public.manager_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#16a918',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.manager_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All view groups" ON public.manager_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leaders manage groups" ON public.manager_groups FOR ALL USING (has_role(auth.uid(), 'leader'));

CREATE TABLE public.manager_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.manager_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  UNIQUE(group_id, user_id)
);
ALTER TABLE public.manager_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All view group members" ON public.manager_group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leaders manage group members" ON public.manager_group_members FOR ALL USING (has_role(auth.uid(), 'leader'));

-- 9. MANAGER KPI
CREATE TABLE public.manager_kpi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  monthly_revenue_target NUMERIC NOT NULL DEFAULT 0,
  monthly_invoices_target INTEGER NOT NULL DEFAULT 0,
  monthly_clients_target INTEGER NOT NULL DEFAULT 0,
  set_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.manager_kpi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own kpi" ON public.manager_kpi FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Leaders manage kpi" ON public.manager_kpi FOR ALL USING (has_role(auth.uid(), 'leader'));

-- 10. ONE-ON-ONE NOTES
CREATE TABLE public.one_on_one_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID NOT NULL,
  leader_id UUID NOT NULL,
  body TEXT NOT NULL,
  meeting_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.one_on_one_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leaders manage 1on1" ON public.one_on_one_notes FOR ALL USING (has_role(auth.uid(), 'leader'));
CREATE POLICY "Manager views own 1on1" ON public.one_on_one_notes FOR SELECT USING (auth.uid() = manager_id);

-- 11. MYSTERY BOXES
CREATE TABLE public.mystery_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mystery_boxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own boxes" ON public.mystery_boxes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Leaders view all boxes" ON public.mystery_boxes FOR SELECT USING (has_role(auth.uid(), 'leader'));

-- 12. FORTUNE WHEEL
CREATE TABLE public.fortune_wheel_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reward_xp INTEGER NOT NULL DEFAULT 0,
  reward_label TEXT NOT NULL DEFAULT '',
  spun_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fortune_wheel_spins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own spins" ON public.fortune_wheel_spins FOR ALL USING (auth.uid() = user_id);

-- Realtime for new tables only
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_log;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.audit_log REPLICA IDENTITY FULL;