
CREATE TABLE IF NOT EXISTS public.gifts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  icon text not null default '🎁',
  kind text not null default 'physical',
  value integer not null default 0,
  is_active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gifts TO authenticated;
GRANT ALL ON public.gifts TO service_role;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gifts_read" ON public.gifts FOR SELECT TO authenticated USING (true);
CREATE POLICY "gifts_manage" ON public.gifts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'leader')) WITH CHECK (public.has_role(auth.uid(),'leader'));

CREATE TABLE IF NOT EXISTS public.gift_grants (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid references public.gifts(id) on delete set null,
  user_id uuid not null,
  granted_by uuid,
  reason text not null default '',
  status text not null default 'pending',
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gift_grants TO authenticated;
GRANT ALL ON public.gift_grants TO service_role;
ALTER TABLE public.gift_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gift_grants_read_own" ON public.gift_grants FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'leader'));
CREATE POLICY "gift_grants_insert_leader" ON public.gift_grants FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'leader'));
CREATE POLICY "gift_grants_update" ON public.gift_grants FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'leader'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'leader'));
CREATE POLICY "gift_grants_delete_leader" ON public.gift_grants FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'leader'));

CREATE TABLE IF NOT EXISTS public.contest_participants (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null,
  progress numeric not null default 0,
  joined_at timestamptz not null default now(),
  unique (contest_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contest_participants TO authenticated;
GRANT ALL ON public.contest_participants TO service_role;
ALTER TABLE public.contest_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cp_read" ON public.contest_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "cp_insert_own" ON public.contest_participants FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "cp_update_own" ON public.contest_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'leader'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'leader'));
CREATE POLICY "cp_delete_own" ON public.contest_participants FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'leader'));

ALTER TABLE public.contests
  ADD COLUMN IF NOT EXISTS gift_id uuid REFERENCES public.gifts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS prize_second text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS prize_third text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS auto_award boolean NOT NULL DEFAULT true;

INSERT INTO public.gifts (title, description, icon, kind, value)
SELECT * FROM (VALUES
  ('Сертификат Ozon 3 000 ₽','Электронный сертификат на покупки','🛍️','physical',3000),
  ('Выходной день','Дополнительный оплачиваемый выходной','🏖️','custom',1),
  ('Ужин в ресторане','Сертификат на ужин на двоих','🍽️','physical',5000),
  ('AirPods','Беспроводные наушники','🎧','physical',15000),
  ('+2000 XP','Мгновенное начисление опыта','⚡','xp',2000),
  ('Мерч компании','Худи и кружка с логотипом','👕','physical',2500)
) AS v(title, description, icon, kind, value)
WHERE NOT EXISTS (SELECT 1 FROM public.gifts);
