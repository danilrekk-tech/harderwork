import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ClientRow { id: string; name: string; company: string; email: string; phone: string; deal_status: string; invoice_amount: number; user_id: string; created_at: string; }

const STATUS_LABELS: Record<string, string> = { processed: '🔄 В обработке', invoice_sent: '📤 Счёт отправлен', invoice_paid: '✅ Оплачено' };

export default function AllClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  useEffect(() => { load(); }, []);

  async function load() {
    const [{ data: cl }, { data: profs }] = await Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('user_id, name'),
    ]);
    if (cl) setClients(cl as unknown as ClientRow[]);
    if (profs) { const map: Record<string, string> = {}; (profs as any[]).forEach(p => map[p.user_id] = p.name); setProfiles(map); }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">👥 Все клиенты</h1>
      <p className="text-sm text-muted-foreground mb-6">Всего: {clients.length}</p>
      <div className="widget-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Менеджер</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Компания</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Дата</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map(c => (
              <TableRow key={c.id}>
                <TableCell className="text-sm">{profiles[c.user_id] || '—'}</TableCell>
                <TableCell className="font-medium">{c.name || '—'}</TableCell>
                <TableCell className="text-sm">{c.company || '—'}</TableCell>
                <TableCell><Badge variant="secondary" className="text-xs">{STATUS_LABELS[c.deal_status] || c.deal_status}</Badge></TableCell>
                <TableCell className="font-semibold">{Number(c.invoice_amount).toLocaleString()} ₽</TableCell>
                <TableCell className="text-sm">{new Date(c.created_at).toLocaleDateString('ru-RU')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
