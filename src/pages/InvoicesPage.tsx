import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Invoice } from '@/types';

export default function InvoicesPage() {
  const { state, addInvoice, payInvoice, checkAchievements } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');

  function handleSubmit() {
    if (!amount) return;
    const invoice: Invoice = {
      id: crypto.randomUUID(),
      clientId: clientId || '',
      amount: Number(amount),
      status: 'issued',
      issuedAt: new Date().toISOString(),
    };
    addInvoice(invoice);
    checkAchievements();
    setAmount('');
    setClientId('');
    setDialogOpen(false);
  }

  function handlePay(id: string) {
    payInvoice(id);
    checkAchievements();
  }

  const totalIssued = state.invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = state.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">📄 Счета</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-1" /> Выставить счёт</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Новый счёт</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Выберите клиента" /></SelectTrigger>
                <SelectContent>
                  {state.clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} — {c.company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Сумма *" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
              <Button onClick={handleSubmit} className="w-full">Выставить</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="widget-card text-center">
          <div className="stat-value text-info">{totalIssued.toLocaleString()} ₽</div>
          <div className="stat-label">Выставлено</div>
        </div>
        <div className="widget-card text-center">
          <div className="stat-value text-success">{totalPaid.toLocaleString()} ₽</div>
          <div className="stat-label">Оплачено</div>
        </div>
      </div>

      <div className="space-y-3">
        {state.invoices.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Нет выставленных счетов</div>
        )}
        {[...state.invoices].reverse().map((inv, i) => {
          const client = state.clients.find(c => c.id === inv.clientId);
          return (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="widget-card flex items-center gap-4"
            >
              <div className="flex-1">
                <div className="font-semibold text-foreground">{inv.amount.toLocaleString()} ₽</div>
                <div className="text-sm text-muted-foreground">
                  {client ? `${client.name} — ${client.company}` : 'Без клиента'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(inv.issuedAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
              {inv.status === 'paid' ? (
                <Badge className="bg-success/10 text-success">Оплачен</Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={() => handlePay(inv.id)}>
                  <CheckCircle className="w-4 h-4 mr-1" /> Оплачен
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
