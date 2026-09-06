import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Trophy, Users, Clock, Gift as GiftIcon } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';

interface Contest {
  id: string;
  title: string;
  description: string;
  type: string;
  start_date: string;
  end_date: string;
  prize: string;
  prize_second?: string;
  prize_third?: string;
  prize_xp: number;
  metric: string;
  target: number;
  is_active: boolean;
  gift_id?: string | null;
}

interface Participant { id: string; contest_id: string; user_id: string; progress: number }
interface Gift { id: string; title: string; icon: string; description: string }

const METRIC_LABELS: Record<string, string> = { revenue: 'Выручка, ₽', invoices: 'Счета', clients: 'Клиенты' };

function daysLeft(end: string) {
  if (!end) return null;
  const diff = Math.ceil((new Date(end).getTime() - Date.now()) / 86400000);
  return diff;
}

export default function ViewContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [gifts, setGifts] = useState<Record<string, Gift>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);
    const [c, p, pr, g] = await Promise.all([
      supabase.from('contests').select('*').order('created_at', { ascending: false }),
      supabase.from('contest_participants').select('*'),
      supabase.from('profiles').select('user_id, name'),
      supabase.from('gifts').select('id, title, icon, description'),
    ]);
    setContests(((c.data as unknown as Contest[]) || []).filter(x => x.is_active));
    setParticipants((p.data as unknown as Participant[]) || []);
    setNames(Object.fromEntries(((pr.data as { user_id: string; name: string }[]) || []).map(x => [x.user_id, x.name])));
    setGifts(Object.fromEntries(((g.data as Gift[]) || []).map(x => [x.id, x])));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const join = async (contestId: string) => {
    if (!userId) return;
    const { error } = await supabase.from('contest_participants').insert({ contest_id: contestId, user_id: userId, progress: 0 });
    if (error) return toast.error('Не удалось присоединиться');
    toast.success('Вы участвуете в конкурсе!');
    load();
  };

  const board = useMemo(() => (contestId: string) =>
    participants
      .filter(p => p.contest_id === contestId)
      .sort((a, b) => Number(b.progress) - Number(a.progress)),
  [participants]);

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Конкурсы"
        subtitle="Соревнуйтесь с командой, забирайте призы и подарки"
        icon={Trophy}
      />

      {loading ? (
        <div className="widget-card text-center py-10 text-muted-foreground">Загрузка…</div>
      ) : contests.length === 0 ? (
        <div className="widget-card text-center py-12">
          <Trophy className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Активных конкурсов пока нет</p>
        </div>
      ) : (
        <div className="space-y-5">
          {contests.map((c, i) => {
            const rows = board(c.id);
            const mine = rows.find(r => r.user_id === userId);
            const myPct = mine ? Math.min(100, (Number(mine.progress) / (c.target || 1)) * 100) : 0;
            const left = daysLeft(c.end_date);
            const gift = c.gift_id ? gifts[c.gift_id] : null;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="widget-card-glass p-0 overflow-hidden">
                  <div className="p-5 border-b border-border/60">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display font-semibold text-lg text-foreground">{c.title}</h3>
                          <Badge variant="secondary">{c.type === 'team' ? <><Users className="w-3 h-3 mr-1" />Команда</> : 'Личный'}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-xl">{c.description}</p>
                      </div>
                      {left !== null && (
                        <Badge className={`border-0 ${left <= 3 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                          <Clock className="w-3 h-3 mr-1" />
                          {left > 0 ? `${left} дн. осталось` : 'Завершается'}
                        </Badge>
                      )}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3 mt-4">
                      {[
                        { place: '🥇 1 место', text: c.prize || '—' },
                        { place: '🥈 2 место', text: c.prize_second || '—' },
                        { place: '🥉 3 место', text: c.prize_third || '—' },
                      ].map(p => (
                        <div key={p.place} className="rounded-xl bg-muted/50 px-3 py-2">
                          <div className="text-xs text-muted-foreground">{p.place}</div>
                          <div className="text-sm font-medium text-foreground truncate">{p.text}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
                      <Badge variant="secondary">{METRIC_LABELS[c.metric] || c.metric}: {c.target.toLocaleString('ru-RU')}</Badge>
                      <Badge className="bg-primary/10 text-primary border-0">+{c.prize_xp} XP</Badge>
                      {gift && <Badge className="bg-accent/10 text-accent border-0"><GiftIcon className="w-3 h-3 mr-1" />{gift.icon} {gift.title}</Badge>}
                    </div>
                  </div>

                  <div className="p-5">
                    {mine ? (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-muted-foreground">Мой прогресс</span>
                          <span className="font-semibold">{Number(mine.progress).toLocaleString('ru-RU')} / {c.target.toLocaleString('ru-RU')}</span>
                        </div>
                        <Progress value={myPct} className="h-2.5" />
                      </div>
                    ) : (
                      <Button size="sm" className="mb-4" onClick={() => join(c.id)}>Участвовать</Button>
                    )}

                    <Tabs defaultValue="board">
                      <TabsList>
                        <TabsTrigger value="board">Таблица лидеров ({rows.length})</TabsTrigger>
                        <TabsTrigger value="rules">Правила</TabsTrigger>
                      </TabsList>
                      <TabsContent value="board" className="pt-3">
                        {rows.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Пока никто не участвует — станьте первым.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {rows.slice(0, 10).map((r, idx) => (
                              <div key={r.id} className={`flex items-center gap-3 px-3 py-2 rounded-xl ${r.user_id === userId ? 'bg-primary/8 border border-primary/20' : 'bg-muted/40'}`}>
                                <span className="w-6 text-center text-sm">{['🥇', '🥈', '🥉'][idx] || idx + 1}</span>
                                <span className="flex-1 text-sm font-medium truncate">{names[r.user_id] || 'Участник'}</span>
                                <span className="text-sm text-muted-foreground">{Number(r.progress).toLocaleString('ru-RU')}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="rules" className="pt-3 text-sm text-muted-foreground space-y-1">
                        <p>Метрика: {METRIC_LABELS[c.metric] || c.metric}. Цель: {c.target.toLocaleString('ru-RU')}.</p>
                        <p>Период: {c.start_date || '—'} — {c.end_date || '—'}.</p>
                        <p>Награды начисляются руководителем по завершении конкурса.</p>
                      </TabsContent>
                    </Tabs>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
