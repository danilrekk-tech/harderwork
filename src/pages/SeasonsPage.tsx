import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface Season { id: string; number: number; start_date: string; end_date: string; is_active: boolean; }

export default function SeasonsPage() {
  const { user } = useAuth();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ number: 1, start_date: '', end_date: '', is_active: true });

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('seasons').select('*').order('number', { ascending: false });
    if (data) setSeasons(data as unknown as Season[]);
  }

  async function save() {
    await supabase.from('seasons').insert(form);
    toast.success('Сезон создан');
    setDialog(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm('Удалить сезон?')) return;
    await supabase.from('seasons').delete().eq('id', id);
    toast.success('Удалено');
    load();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">🗓 Сезоны</h1>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={() => { setForm({ number: seasons.length + 1, start_date: '', end_date: '', is_active: true }); setDialog(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Новый сезон
        </Button>
      </div>
      {seasons.length === 0 ? (
        <div className="widget-card text-center py-8 text-muted-foreground">Нет сезонов</div>
      ) : (
        <div className="space-y-2">
          {seasons.map(s => (
            <Card key={s.id} className="p-4 widget-card flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Сезон #{s.number}</div>
                <div className="text-sm text-muted-foreground">{s.start_date} — {s.end_date}</div>
              </div>
              <div className="flex items-center gap-2">
                {s.is_active && <Badge>Активный</Badge>}
                <Button variant="ghost" size="icon" onClick={() => remove(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Новый сезон</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Номер</Label><Input type="number" value={form.number} onChange={e => setForm(f => ({ ...f, number: Number(e.target.value) }))} /></div>
            <div><Label>Начало</Label><Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></div>
            <div><Label>Конец</Label><Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>Отмена</Button><Button onClick={save}>Создать</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
