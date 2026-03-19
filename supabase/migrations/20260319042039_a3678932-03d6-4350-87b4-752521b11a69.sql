
-- Team plan set by leader for all managers
CREATE TABLE public.team_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  plan_type text NOT NULL DEFAULT 'amount',
  plan_target numeric NOT NULL DEFAULT 0,
  month text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(created_by, month)
);

ALTER TABLE public.team_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaders can manage team plans" ON public.team_plan FOR ALL USING (has_role(auth.uid(), 'leader'::app_role));
CREATE POLICY "Managers can view team plans" ON public.team_plan FOR SELECT TO authenticated USING (true);

-- Penalties system
CREATE TABLE public.penalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_by uuid NOT NULL,
  reason text NOT NULL DEFAULT '',
  xp_amount integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.penalties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaders can manage penalties" ON public.penalties FOR ALL USING (has_role(auth.uid(), 'leader'::app_role));
CREATE POLICY "Users can view own penalties" ON public.penalties FOR SELECT USING (auth.uid() = user_id);

-- Penalty templates
CREATE TABLE public.penalty_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  xp_amount integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.penalty_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaders can manage penalty templates" ON public.penalty_templates FOR ALL USING (has_role(auth.uid(), 'leader'::app_role));
CREATE POLICY "Penalty templates viewable by all" ON public.penalty_templates FOR SELECT TO authenticated USING (true);

-- Add delete policy for invites (for revoking)
CREATE POLICY "Leaders can delete invites" ON public.invites FOR DELETE USING (has_role(auth.uid(), 'leader'::app_role));
