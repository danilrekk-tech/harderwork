import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, AlertTriangle, Plus, Users, Shield, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ManagerRow {
  user_id: string;
  name: string;
  level: number;
  xp: number;
  total_xp_earned: number;
  streak_days: number;
  processed_clients_count: number;
  last_active_date: string;
}

interface PenaltyTemplate {
  id: string;
  title: string;
  description: string;
  xp_amount: number;
}

export default function ManagersPage() {
  const { user } = useAuth();
  const [managers, setManagers] = useState<ManagerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, { invoices: number; paid: number; revenue: number; clients: number }>>({});
  const [penaltyDialog, setPenaltyDialog] = useState<{ open: boolean; userId: string; name: string }>({ open: false, userId: '', name: '' });
  const [penaltyReason, setPenaltyReason] = useState('');
  const [penaltyXp, setPenaltyXp] = useState(50);
  const [templates, setTemplates] = useState<PenaltyTemplate[]>([]);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [templateForm, setTemplateForm] = useState({ title: '', description: '', xp_amount: 50 });
  const [penalties, setPenalties] = useState<Record<string, number>>({});

  useEffect(() => { loadManagers(); loadTemplates(); }, []);

  async function loadTemplates() {
    const { data } = await supabase.from('penalty_templates').select('*').order('created_at', { ascending: false });
    if (data) setTemplates(data as unknown as PenaltyTemplate[]);
  }

  async function loadManagers() {
    setLoading(true);
    const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'manager' as any);
    if (!roles?.length) { setManagers([]); setLoading(false); return; }

    const managerIds = roles.map(r => r.user_id);
    const { data: profiles } = await supabase.from('profiles').select('*').in('user_id', managerIds);
    if (profiles) setManagers(profiles as unknown as ManagerRow[]);

    const { data: invoices } = await supabase.from('invoices').select('user_id, amount, status').in('user_id', managerIds);
    const { data: clients } = await supabase.from('clients').select('user_id').in('user_id', managerIds);
    const { data: penaltiesData } = await supabase.from('penalties').select('user_id, xp_amount');

    const statsMap: Record<string, { invoices: number; paid: number; revenue: number; clients: number }> = {};
    const penaltiesMap: Record<string, number> = {};
    managerIds.forEach(id => { statsMap[id] = { invoices: 0, paid: 0, revenue: 0, clients: 0 }; penaltiesMap[id] = 0; });

    invoices?.forEach(inv => {
      if (!statsMap[inv.user_id]) return;
      statsMap[inv.user_id].invoices++;
      if (inv.status === 'paid') { statsMap[inv.user_id].paid++; statsMap[inv.user_id].revenue += Number(inv.amount); }
    });
    clients?.forEach(c => { if (statsMap[c.user_id]) statsMap[c.user_id].clients++; });
    (penaltiesData as any[])?.forEach(p => { if (penaltiesMap[p.user_id] !== undefined) penaltiesMap[p.user_id] += p.xp_amount; });

    setStats(statsMap);
    setPenalties(penaltiesMap);
    setLoading(false);
  }

  async function deleteManager(userId: string) {
    if (!confirm('Удалить менеджера? Его данные останутся, но он потеряет доступ.')) return;
    await supabase.from('user_roles').delete().eq('user_id', userId);
    toast.success('Менеджер удалён');
    loadManagers();
  }

  async function applyPenalty() {
    if (!user || !penaltyDialog.userId) return;
    const { error } = await supabase.from('penalties').insert({
      user_id: penaltyDialog.userId, created_by: user.id, reason: penaltyReason, xp_amount: penaltyXp,
    } as any);
    if (error) toast.error('Ошибка');
    else {
      toast.success(`Штраф -${penaltyXp} XP наложен на ${penaltyDialog.name}`);
      const { data: profile } = await supabase.from('profiles').select('xp, total_xp_earned').eq('user_id', penaltyDialog.userId).maybeSingle();
      if (profile) {
        await supabase.from('profiles').update({ total_xp_earned: Math.max(0, profile.total_xp_earned - penaltyXp) }).eq('user_id', penaltyDialog.userId);
      }
    }
    setPenaltyDialog({ open: false, userId: '', name: '' });
    setPenaltyReason('');
    setPenaltyXp(50);
    loadManagers();
  }

  async function saveTemplate() {
    if (!user || !templateForm.title.trim()) { toast.error('Укажите название'); return; }
    const { error } = await supabase.from('penalty_templates').insert({ ...templateForm, created_by: user.id } as any);
    if (error) toast.error('Ошибка');
    else { toast.success('Шаблон создан'); setTemplateDialog(false); setTemplateForm({ title: '', description: '', xp_amount: 50 }); loadTemplates(); }
  }

  async function deleteTemplate(id: string) {
    await supabase.from('penalty_templates').delete().eq('id', id);
    toast.success('Шаблон удалён');
    loadTemplates();
  }

  function selectTemplate(t: PenaltyTemplate) {
    setPenaltyReason(t.title + (t.description ? `: ${t.description}` : ''));
    setPenaltyXp(t.xp_amount);
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto animate-pulse space-y-4">
        <div className="h-10 w-48 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
        <Users className="w-7 h-7 text-primary" />
        Менеджеры
        <Badge variant="secondary" className="text-xs ml-2">{managers.length}</Badge>
      </h1>

      {managers.length === 0 ? (
        <Card className="text-center py-12 widget-card">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-lg font-display font-semibold text-foreground mb-1">Нет менеджеров</p>
          <p className="text-sm text-muted-foreground">Создайте инвайт-ссылку в Настройках</p>
        </Card>
      ) : (
        <div className="widget-card overflow-x-auto mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Менеджер</TableHead>
                <TableHead className="text-xs">Уровень</TableHead>
                <TableHead className="text-xs">Клиенты</TableHead>
                <TableHead className="text-xs">Счета</TableHead>
                <TableHead className="text-xs">Выручка</TableHead>
                <TableHead className="text-xs">Штрафы</TableHead>
                <TableHead className="text-xs">Серия</TableHead>
                <TableHead className="text-xs text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managers.map((m, idx) => {
                const s = stats[m.user_id] || { invoices: 0, paid: 0, revenue: 0, clients: 0 };
                const pen = penalties[m.user_id] || 0;
                return (
                  <TableRow key={m.user_id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-foreground">{m.name}</div>
                          <div className="text-[10px] text-accent">{m.total_xp_earned} XP</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><span className="level-badge text-[10px] !px-2 !py-0.5">Ур. {m.level}</span></TableCell>
                    <TableCell className="text-sm">{s.clients}</TableCell>
                    <TableCell className="text-sm">{s.invoices} <span className="text-xs text-muted-foreground">({s.paid} опл.)</span></TableCell>
                    <TableCell className="font-semibold text-sm">{s.revenue.toLocaleString('ru-RU')} ₽</TableCell>
                    <TableCell>
                      {pen > 0 ? <span className="penalty-badge text-[10px]">-{pen} XP</span> : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        {m.streak_days}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPenaltyDialog({ open: true, userId: m.user_id, name: m.name })}>
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteManager(m.user_id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Penalty Templates */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="widget-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            <h2 className="font-display font-semibold text-foreground">Шаблоны штрафов</h2>
          </div>
          <Button size="sm" onClick={() => setTemplateDialog(true)} className="h-8 text-xs">
            <Plus className="w-3 h-3 mr-1" /> Добавить
          </Button>
        </div>
        {templates.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">Нет шаблонов штрафов</p>
            <p className="text-[11px] text-muted-foreground mt-1">Создайте шаблон для быстрого наложения</p>
          </div>
        ) : (
          <div className="space-y-2">
            {templates.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground">{t.title}</div>
                  {t.description && <div className="text-[11px] text-muted-foreground truncate">{t.description}</div>}
                </div>
                <span className="penalty-badge text-[10px]">-{t.xp_amount} XP</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteTemplate(t.id)}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Penalty Dialog */}
      <Dialog open={penaltyDialog.open} onOpenChange={o => setPenaltyDialog(p => ({ ...p, open: o }))}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">⚠️ Штраф — {penaltyDialog.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {templates.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">Шаблон</Label>
                <Select onValueChange={v => { const t = templates.find(t => t.id === v); if (t) selectTemplate(t); }}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Выбрать шаблон..." /></SelectTrigger>
                  <SelectContent>
                    {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.title} (-{t.xp_amount} XP)</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div><Label className="text-xs">Причина</Label><Input value={penaltyReason} onChange={e => setPenaltyReason(e.target.value)} placeholder="Опоздание, невыполнение..." className="h-10" /></div>
            <div><Label className="text-xs">Штраф XP</Label><Input type="number" value={penaltyXp} onChange={e => setPenaltyXp(Number(e.target.value))} className="h-10" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPenaltyDialog({ open: false, userId: '', name: '' })}>Отмена</Button>
            <Button variant="destructive" onClick={applyPenalty}>Наложить штраф</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">Новый шаблон</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Название</Label><Input value={templateForm.title} onChange={e => setTemplateForm(f => ({ ...f, title: e.target.value }))} placeholder="Опоздание" className="h-10" /></div>
            <div><Label className="text-xs">Описание</Label><Input value={templateForm.description} onChange={e => setTemplateForm(f => ({ ...f, description: e.target.value }))} placeholder="Описание нарушения" className="h-10" /></div>
            <div><Label className="text-xs">Штраф XP</Label><Input type="number" value={templateForm.xp_amount} onChange={e => setTemplateForm(f => ({ ...f, xp_amount: Number(e.target.value) }))} className="h-10" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialog(false)}>Отмена</Button>
            <Button onClick={saveTemplate}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
