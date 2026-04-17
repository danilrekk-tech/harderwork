import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Kanban, Phone, Mail, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface Stage { id: string; name: string; color: string; position: number; }
interface Client { id: string; name: string; company: string; invoice_amount: number; stage_id: string | null; temperature: string | null; phone: string; email: string; }

const DEFAULT_STAGES = [
  { name: 'Новый', color: '#94a3b8' },
  { name: 'Переговоры', color: '#3b82f6' },
  { name: 'Счёт выставлен', color: '#f59e0b' },
  { name: 'Оплачен', color: '#16a918' },
];

export default function DealFunnelPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', invoice_amount: 0, phone: '', email: '', stage_id: '', temperature: 'warm' });

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    let { data: stageData } = await supabase.from('deal_stages').select('*').eq('user_id', user.id).order('position');
    if (!stageData || stageData.length === 0) {
      const inserts = DEFAULT_STAGES.map((s, i) => ({ user_id: user.id, name: s.name, color: s.color, position: i }));
      await supabase.from('deal_stages').insert(inserts);
      ({ data: stageData } = await supabase.from('deal_stages').select('*').eq('user_id', user.id).order('position'));
    }
    setStages((stageData as Stage[]) || []);
    const { data: clientData } = await supabase.from('clients').select('id, name, company, invoice_amount, stage_id, temperature, phone, email').eq('user_id', user.id);
    setClients((clientData as Client[]) || []);
  };

  useEffect(() => { load(); }, []);

  const moveClient = async (clientId: string, stageId: string) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, stage_id: stageId } : c));
    await supabase.from('clients').update({ stage_id: stageId }).eq('id', clientId);
  };

  const create = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('clients').insert({
      user_id: user.id, name: form.name, company: form.company,
      invoice_amount: form.invoice_amount, phone: form.phone, email: form.email,
      stage_id: form.stage_id || stages[0]?.id, temperature: form.temperature,
    });
    toast.success('Сделка добавлена');
    setOpen(false);
    setForm({ name: '', company: '', invoice_amount: 0, phone: '', email: '', stage_id: '', temperature: 'warm' });
    load();
  };

  const tempColor = (t: string | null) => t === 'hot' ? 'bg-destructive/15 text-destructive' : t === 'cold' ? 'bg-info/15 text-info' : 'bg-warning/15 text-warning';
  const tempLabel = (t: string | null) => t === 'hot' ? '🔥' : t === 'cold' ? '❄️' : '☀️';

  return (
    <div className="max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Kanban className="w-5 h-5 text-primary" /></div>
          <div>
            <h1 className="page-title">Воронка сделок</h1>
            <p className="page-subtitle">Перетаскивайте сделки между стадиями</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="quick-action-btn"><Plus className="w-4 h-4" /> Добавить сделку</Button></DialogTrigger>
          <DialogContent className="glass-strong">
            <DialogHeader><DialogTitle>Новая сделка</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Имя клиента" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Компания" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
              <Input placeholder="Телефон" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input type="number" placeholder="Сумма" value={form.invoice_amount} onChange={e => setForm({ ...form, invoice_amount: +e.target.value })} />
              <Select value={form.temperature} onValueChange={v => setForm({ ...form, temperature: v })}>
                <SelectTrigger><SelectValue placeholder="Температура" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">🔥 Горячий</SelectItem>
                  <SelectItem value="warm">☀️ Тёплый</SelectItem>
                  <SelectItem value="cold">❄️ Холодный</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={create} disabled={!form.name} className="w-full quick-action-btn">Создать</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {stages.map(stage => {
          const stageClients = clients.filter(c => c.stage_id === stage.id);
          const total = stageClients.reduce((s, c) => s + Number(c.invoice_amount || 0), 0);
          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-72 glass rounded-2xl p-3"
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (draggedId) moveClient(draggedId, stage.id); setDraggedId(null); }}
            >
              <div className="flex items-center gap-2 mb-3 px-2">
                <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                <span className="font-semibold text-sm">{stage.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{stageClients.length}</span>
              </div>
              <div className="text-xs text-muted-foreground px-2 mb-2">Σ {total.toLocaleString('ru')} ₽</div>
              <div className="space-y-2 min-h-[100px]">
                {stageClients.map(c => (
                  <Card
                    key={c.id} draggable
                    onDragStart={() => setDraggedId(c.id)}
                    className="p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all border-border bg-card"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-3 h-3 text-muted-foreground mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-sm truncate">{c.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tempColor(c.temperature)}`}>{tempLabel(c.temperature)}</span>
                        </div>
                        {c.company && <div className="text-xs text-muted-foreground truncate">{c.company}</div>}
                        <div className="text-xs font-semibold text-primary mt-1">{Number(c.invoice_amount).toLocaleString('ru')} ₽</div>
                        <div className="flex gap-2 mt-1.5 text-muted-foreground">
                          {c.phone && <a href={`tel:${c.phone}`} className="hover:text-primary"><Phone className="w-3 h-3" /></a>}
                          {c.email && <a href={`mailto:${c.email}`} className="hover:text-primary"><Mail className="w-3 h-3" /></a>}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
