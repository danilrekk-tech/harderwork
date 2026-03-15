import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Client, DealStatus } from '@/types';

const STATUS_LABELS: Record<DealStatus, string> = {
  processed: 'Обработан',
  invoice_sent: 'Счёт выставлен',
  invoice_paid: 'Оплачен',
};

const STATUS_COLORS: Record<DealStatus, string> = {
  processed: 'bg-muted text-muted-foreground',
  invoice_sent: 'bg-info/10 text-info',
  invoice_paid: 'bg-success/10 text-success',
};

export default function ClientsPage() {
  const { state, addClient, updateDealStatus } = useApp();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', product: '', invoiceAmount: '', notes: '' });

  const filtered = state.clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.product.toLowerCase().includes(search.toLowerCase())
  );

  function handleSubmit() {
    if (!form.name) return;
    const client: Client = {
      id: crypto.randomUUID(),
      name: form.name,
      company: form.company,
      phone: form.phone,
      email: form.email,
      product: form.product,
      dealStatus: 'processed',
      invoiceAmount: Number(form.invoiceAmount) || 0,
      notes: form.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addClient(client);
    setForm({ name: '', company: '', phone: '', email: '', product: '', invoiceAmount: '', notes: '' });
    setDialogOpen(false);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">👥 Клиенты</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-1" /> Добавить</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Новый клиент</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <Input placeholder="Имя *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              <Input placeholder="Компания" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
              <Input placeholder="Телефон" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              <Input placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              <Input placeholder="Предложение / Продукт" value={form.product} onChange={e => setForm(p => ({ ...p, product: e.target.value }))} />
              <Input placeholder="Сумма счёта" type="number" value={form.invoiceAmount} onChange={e => setForm(p => ({ ...p, invoiceAmount: e.target.value }))} />
              <Input placeholder="Заметки" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              <Button onClick={handleSubmit} className="w-full">Сохранить</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Поиск клиентов..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {state.clients.length === 0 ? 'Добавьте первого клиента' : 'Ничего не найдено'}
          </div>
        )}
        {filtered.map((client, i) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="widget-card"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground">{client.name}</div>
                {client.company && <div className="text-sm text-muted-foreground">{client.company}</div>}
                <div className="text-sm text-muted-foreground mt-1">{client.product}</div>
                {client.invoiceAmount > 0 && (
                  <div className="text-sm font-medium text-foreground mt-1">{client.invoiceAmount.toLocaleString()} ₽</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={STATUS_COLORS[client.dealStatus]}>{STATUS_LABELS[client.dealStatus]}</Badge>
                <Select value={client.dealStatus} onValueChange={(v) => updateDealStatus(client.id, v as DealStatus)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="processed">Обработан</SelectItem>
                    <SelectItem value="invoice_sent">Счёт выставлен</SelectItem>
                    <SelectItem value="invoice_paid">Оплачен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
