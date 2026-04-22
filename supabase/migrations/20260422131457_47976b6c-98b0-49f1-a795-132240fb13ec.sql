-- ============= GAMIFICATION+ =============

-- Daily rewards (ежедневный бонус)
CREATE TABLE IF NOT EXISTS public.daily_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  claimed_date date NOT NULL,
  day_number int NOT NULL DEFAULT 1,
  xp_reward int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, claimed_date)
);
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own daily rewards" ON public.daily_rewards FOR ALL USING (auth.uid() = user_id);

-- Quests
CREATE TABLE IF NOT EXISTS public.quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '🗺️',
  quest_type text NOT NULL DEFAULT 'daily',
  target_metric text NOT NULL DEFAULT 'revenue',
  target_value int NOT NULL DEFAULT 0,
  xp_reward int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quests viewable by all" ON public.quests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leaders manage quests" ON public.quests FOR ALL USING (has_role(auth.uid(), 'leader'::app_role));

CREATE TABLE IF NOT EXISTS public.user_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quest_id uuid NOT NULL,
  progress int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, quest_id)
);
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own quests" ON public.user_quests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Leaders view all user quests" ON public.user_quests FOR SELECT USING (has_role(auth.uid(), 'leader'::app_role));

-- Pet (питомец-маскот)
CREATE TABLE IF NOT EXISTS public.pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  name text NOT NULL DEFAULT 'Лис',
  species text NOT NULL DEFAULT 'fox',
  level int NOT NULL DEFAULT 1,
  xp int NOT NULL DEFAULT 0,
  happiness int NOT NULL DEFAULT 50,
  hunger int NOT NULL DEFAULT 50,
  last_fed_at timestamptz NOT NULL DEFAULT now(),
  evolution_stage int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pet" ON public.pets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Leaders view all pets" ON public.pets FOR SELECT USING (has_role(auth.uid(), 'leader'::app_role));

-- Duels (дуэли менеджеров)
CREATE TABLE IF NOT EXISTS public.duels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid NOT NULL,
  opponent_id uuid NOT NULL,
  metric text NOT NULL DEFAULT 'revenue',
  target int NOT NULL DEFAULT 0,
  stake_xp int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  winner_id uuid,
  started_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL DEFAULT (now() + interval '1 day'),
  challenger_score int NOT NULL DEFAULT 0,
  opponent_score int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own duels" ON public.duels FOR SELECT USING (auth.uid() IN (challenger_id, opponent_id));
CREATE POLICY "Users create duels they participate" ON public.duels FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Participants update duels" ON public.duels FOR UPDATE USING (auth.uid() IN (challenger_id, opponent_id));
CREATE POLICY "Leaders view all duels" ON public.duels FOR SELECT USING (has_role(auth.uid(), 'leader'::app_role));

-- Leagues
CREATE TABLE IF NOT EXISTS public.leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  tier text NOT NULL DEFAULT 'bronze',
  points int NOT NULL DEFAULT 0,
  season_number int NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All view leagues" ON public.leagues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own league" ON public.leagues FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Leaders manage leagues" ON public.leagues FOR ALL USING (has_role(auth.uid(), 'leader'::app_role));

-- Season Pass
CREATE TABLE IF NOT EXISTS public.season_pass (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  season_number int NOT NULL DEFAULT 1,
  current_tier int NOT NULL DEFAULT 0,
  xp int NOT NULL DEFAULT 0,
  is_premium boolean NOT NULL DEFAULT false,
  claimed_tiers jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.season_pass ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pass" ON public.season_pass FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Leaders view all passes" ON public.season_pass FOR SELECT USING (has_role(auth.uid(), 'leader'::app_role));

-- Secret achievements (отдельный флаг для скрытых)
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS is_secret boolean NOT NULL DEFAULT false;

-- ============= AI & ANALYTICS =============

-- Lead scoring
CREATE TABLE IF NOT EXISTS public.lead_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  score int NOT NULL DEFAULT 0,
  reasoning text NOT NULL DEFAULT '',
  recommendation text NOT NULL DEFAULT '',
  next_action text NOT NULL DEFAULT '',
  scored_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own lead scores" ON public.lead_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Leaders view all lead scores" ON public.lead_scores FOR SELECT USING (has_role(auth.uid(), 'leader'::app_role));

-- AI insights (auto-generated)
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  insight_type text NOT NULL DEFAULT 'tip',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  priority int NOT NULL DEFAULT 1,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own insights" ON public.ai_insights FOR ALL USING (auth.uid() = user_id);

-- Voice notes (расшифровки/тексты)
CREATE TABLE IF NOT EXISTS public.voice_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid,
  transcript text NOT NULL DEFAULT '',
  ai_summary text NOT NULL DEFAULT '',
  duration_seconds int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own voice notes" ON public.voice_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Leaders view all voice notes" ON public.voice_notes FOR SELECT USING (has_role(auth.uid(), 'leader'::app_role));

-- Revenue forecasts
CREATE TABLE IF NOT EXISTS public.revenue_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  scope text NOT NULL DEFAULT 'team',
  forecast_month text NOT NULL,
  predicted_amount numeric NOT NULL DEFAULT 0,
  confidence int NOT NULL DEFAULT 50,
  factors jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_forecasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view forecasts" ON public.revenue_forecasts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leaders manage forecasts" ON public.revenue_forecasts FOR ALL USING (has_role(auth.uid(), 'leader'::app_role));

-- Day summaries
CREATE TABLE IF NOT EXISTS public.day_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  summary_date date NOT NULL,
  summary text NOT NULL DEFAULT '',
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, summary_date)
);
ALTER TABLE public.day_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own day summaries" ON public.day_summaries FOR ALL USING (auth.uid() = user_id);

-- ============= TEAM COLLAB =============

-- Chat
CREATE TABLE IF NOT EXISTS public.chat_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_general boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All view channels" ON public.chat_channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leaders manage channels" ON public.chat_channels FOR ALL USING (has_role(auth.uid(), 'leader'::app_role));

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  reply_to uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All view messages" ON public.chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users send own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id OR has_role(auth.uid(), 'leader'::app_role));

CREATE TABLE IF NOT EXISTS public.message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All view reactions" ON public.message_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own reactions" ON public.message_reactions FOR ALL USING (auth.uid() = user_id);

-- Kudos
CREATE TABLE IF NOT EXISTS public.kudos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  message text NOT NULL DEFAULT '',
  emoji text NOT NULL DEFAULT '👏',
  xp_bonus int NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All view kudos" ON public.kudos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users send kudos" ON public.kudos FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Ideas board
CREATE TABLE IF NOT EXISTS public.ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All view ideas" ON public.ideas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create ideas" ON public.ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors update own ideas" ON public.ideas FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(), 'leader'::app_role));
CREATE POLICY "Leaders delete ideas" ON public.ideas FOR DELETE USING (has_role(auth.uid(), 'leader'::app_role) OR auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.idea_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL,
  user_id uuid NOT NULL,
  vote int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(idea_id, user_id)
);
ALTER TABLE public.idea_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All view idea votes" ON public.idea_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own idea votes" ON public.idea_votes FOR ALL USING (auth.uid() = user_id);

-- Polls
CREATE TABLE IF NOT EXISTS public.polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  closes_at timestamptz,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All view polls" ON public.polls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leaders manage polls" ON public.polls FOR ALL USING (has_role(auth.uid(), 'leader'::app_role));

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL,
  user_id uuid NOT NULL,
  option_index int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All view poll votes" ON public.poll_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users vote own" ON public.poll_votes FOR ALL USING (auth.uid() = user_id);

-- OKR
CREATE TABLE IF NOT EXISTS public.okrs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  scope text NOT NULL DEFAULT 'personal',
  objective text NOT NULL,
  quarter text NOT NULL,
  progress int NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.okrs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All view okrs" ON public.okrs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leaders manage all okrs" ON public.okrs FOR ALL USING (has_role(auth.uid(), 'leader'::app_role));
CREATE POLICY "Users manage own okrs" ON public.okrs FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.okr_key_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  okr_id uuid NOT NULL,
  title text NOT NULL,
  current_value numeric NOT NULL DEFAULT 0,
  target_value numeric NOT NULL DEFAULT 100,
  unit text NOT NULL DEFAULT '%',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.okr_key_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All view kr" ON public.okr_key_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leaders manage all kr" ON public.okr_key_results FOR ALL USING (has_role(auth.uid(), 'leader'::app_role));
CREATE POLICY "Owners update own kr" ON public.okr_key_results FOR UPDATE USING (EXISTS(SELECT 1 FROM public.okrs WHERE okrs.id = okr_id AND okrs.user_id = auth.uid()));

-- Broadcasts (массовые уведомления)
CREATE TABLE IF NOT EXISTS public.broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  audience text NOT NULL DEFAULT 'all',
  sent_by uuid NOT NULL,
  recipients_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leaders manage broadcasts" ON public.broadcasts FOR ALL USING (has_role(auth.uid(), 'leader'::app_role));

-- ============= PRODUCTIVITY =============

-- Message templates (быстрые ответы клиентам)
CREATE TABLE IF NOT EXISTS public.message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  use_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own templates" ON public.message_templates FOR ALL USING (auth.uid() = user_id);

-- Sticky notes
CREATE TABLE IF NOT EXISTS public.sticky_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT 'yellow',
  position_x int NOT NULL DEFAULT 0,
  position_y int NOT NULL DEFAULT 0,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sticky_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sticky notes" ON public.sticky_notes FOR ALL USING (auth.uid() = user_id);

-- Checklists
CREATE TABLE IF NOT EXISTS public.checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  stage text NOT NULL DEFAULT 'general',
  is_template boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own checklists" ON public.checklists FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id uuid NOT NULL,
  text text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own checklist items" ON public.checklist_items FOR ALL USING (EXISTS(SELECT 1 FROM public.checklists WHERE checklists.id = checklist_id AND checklists.user_id = auth.uid()));

-- Pomodoro sessions log
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  duration_minutes int NOT NULL DEFAULT 25,
  task_label text NOT NULL DEFAULT '',
  completed boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pomodoro" ON public.pomodoro_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Leaders view all pomodoro" ON public.pomodoro_sessions FOR SELECT USING (has_role(auth.uid(), 'leader'::app_role));

-- Call timer log
CREATE TABLE IF NOT EXISTS public.call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid,
  duration_seconds int NOT NULL DEFAULT 0,
  outcome text NOT NULL DEFAULT 'neutral',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own call logs" ON public.call_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Leaders view all call logs" ON public.call_logs FOR SELECT USING (has_role(auth.uid(), 'leader'::app_role));

-- Realtime publication for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kudos;