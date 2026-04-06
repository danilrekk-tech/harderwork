import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface InvoiceRow { id: string; amount: number; status: string; issued_at: string; paid_at: string | null; user_id: string; }

export default function AllInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  useEffect(() => { load(); }, []);

  async function load() {
    const [{ data: inv }, { data: profs }] = await Promise.all([
      supabase.from('invoices').select('*').order('issued_at', { ascending: false }),
      supabase.from('profiles').select('user_id, name'),
    ]);
    if (inv) setInvoices(inv as unknown as InvoiceRow[]);
    if (profs) {
      const map: Record<string, string> = {};
      (profs as any[]).forEach(p => map[p.user_id] = p.name);
      setProfiles(map);
    }
  }

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);
  const totalIssued = invoices.filter(i => i.status === 'issued').reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">📄 Все счета</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Оплачено: <span className="font-semibold text-primary">{totalPaid.toLocaleString()} ₽</span> • 
        Ожидает: <span className="font-semibold text-destructive">{totalIssued.toLocaleString()} ₽</span>
      </p>
      <div className="widget-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Менеджер</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Выставлен</TableHead>
              <TableHead>Оплачен</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map(inv => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium">{profiles[inv.user_id] || '—'}</TableCell>
                <TableCell className="font-semibold">{Number(inv.amount).toLocaleString()} ₽</TableCell>
                <TableCell>
                  <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'}>
                    {inv.status === 'paid' ? '✅ Оплачен' : '⏳ Выставлен'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{new Date(inv.issued_at).toLocaleDateString('ru-RU')}</TableCell>
                <TableCell className="text-sm">{inv.paid_at ? new Date(inv.paid_at).toLocaleDateString('ru-RU') : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
