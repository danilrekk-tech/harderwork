import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PenaltyTemplate { id: string; title: string; description: string; xp_amount: number; }
interface Penalty { id: string; user_id: string; reason: string; xp_amount: number; created_at: string; profile_name?: string; }

export default function PenaltiesManagementPage() {
  const { user } = useAuth();
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [templates, setTemplates] = useState<PenaltyTemplate[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [templateDialog, setTemplateDialog] = useState(false);
  const [editTemplate, setEditTemplate] = useState<PenaltyTemplate | null>(null);
  const [form, setForm] = useState({ title: '', description: '', xp_amount: 50 });

  useEffect(() => { load(); }, []);

  async function load() {
    const [{ data: pens }, { data: tmpl }, { data: profs }] = await Promise.all([
      supabase.from('penalties').select('*').order('created_at', { ascending: false }),
      supabase.from('penalty_templates').select('*').order('created_at'),
      supabase.from('profiles').select('user_id, name'),
    ]);
    if (pens) setPenalties(pens as unknown as Penalty[]);
    if (tmpl) setTemplates(tmpl as unknown as PenaltyTemplate[]);
    if (profs) {
      const map: Record<string, string> = {};
      (profs as any[]).forEach(p => { map[p.user_id] = p.name; });
      setProfiles(map);
    }
  }

  function openCreate() { setEditTemplate(null); setForm({ title: '', description: '', xp_amount: 50 }); setTemplateDialog(true); }
  function openEdit(t: PenaltyTemplate) { setEditTemplate(t); setForm({ title: t.title, description: t.description, xp_amount: t.xp_amount }); setTemplateDialog(true); }

  async function saveTemplate() {
    if (!form.title.trim()) { toast.error('Укажите название'); return; }
    if (editTemplate) {
      await supabase.from('penalty_templates').update(form).eq('id', editTemplate.id);
      toast.success('Шаблон обновлён');
    } else {
      await supabase.from('penalty_templates').insert({ ...form, created_by: user!.id });
      toast.success('Шаблон создан');
    }
    setTemplateDialog(false);
    load();
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Удалить шаблон?')) return;
    await supabase.from('penalty_templates').delete().eq('id', id);
    toast.success('Удалено');
    load();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">⚖️ Управление штрафами</h1>

      {/* Templates */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-lg text-foreground">📋 Шаблоны штрафов ({templates.length})</h2>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Новый шаблон</Button>
      </div>
      <div className="widget-card mb-8 overflow-x-auto">
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Нет шаблонов</p>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Название</TableHead><TableHead>Описание</TableHead><TableHead>XP</TableHead><TableHead className="text-right">Действия</TableHead></TableRow></TableHeader>
            <TableBody>
              {templates.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.description}</TableCell>
                  <TableCell className="font-bold text-destructive">-{t.xp_amount}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteTemplate(t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* History */}
      <h2 className="font-display font-semibold text-lg text-foreground mb-3">📜 История штрафов ({penalties.length})</h2>
      <div className="space-y-2">
        {penalties.length === 0 ? (
          <div className="widget-card text-center py-4 text-muted-foreground">Штрафов не было</div>
        ) : penalties.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
            <Card className="p-3 widget-card flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">{profiles[p.user_id] || 'Менеджер'}</div>
                <div className="text-sm text-muted-foreground">{p.reason} • {new Date(p.created_at).toLocaleDateString('ru-RU')}</div>
              </div>
              <Badge variant="destructive">-{p.xp_amount} XP</Badge>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editTemplate ? 'Редактировать шаблон' : 'Новый шаблон штрафа'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Название</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Описание</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>XP штрафа</Label><Input type="number" value={form.xp_amount} onChange={e => setForm(f => ({ ...f, xp_amount: Number(e.target.value) }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialog(false)}>Отмена</Button>
            <Button onClick={saveTemplate}>{editTemplate ? 'Сохранить' : 'Создать'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
