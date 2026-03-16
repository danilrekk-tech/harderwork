import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, FileText, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuickActions() {
  const { state, quickAddClient, quickAddInvoice, quickPayInvoice } = useApp();
  const [amount, setAmount] = useState('');
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const unpaidInvoices = state.invoices.filter(i => i.status === 'issued');

  function handleInvoice() {
    if (!amount || Number(amount) <= 0) return;
    quickAddInvoice(Number(amount));
    setAmount('');
    setInvoiceOpen(false);
  }

  // Momentum display
  const momentumDecayed = state.momentum.lastActionAt
    ? Math.max(0, state.momentum.value - ((Date.now() - new Date(state.momentum.lastActionAt).getTime()) / 60000) * 2)
    : 0;
  const momentumPct = Math.min(100, Math.round(momentumDecayed));
  const isMomentumActive = state.momentum.bonusActiveUntil ? new Date(state.momentum.bonusActiveUntil) > new Date() : false;

  return (
    <div className="widget-card mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-foreground">⚡ Быстрые действия</h3>
        {state.combo.count >= 2 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="combo-badge"
          >
            ⚡ x{state.combo.count}
          </motion.div>
        )}
      </div>

      <div className="flex gap-3 mb-3">
        <Button onClick={quickAddClient} className="flex-1 h-12 text-base quick-action-btn" variant="outline">
          <UserPlus className="w-5 h-5 mr-2" /> Клиент
        </Button>

        <Popover open={invoiceOpen} onOpenChange={setInvoiceOpen}>
          <PopoverTrigger asChild>
            <Button className="flex-1 h-12 text-base quick-action-btn" variant="outline">
              <FileText className="w-5 h-5 mr-2" /> Счёт
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <Input
                placeholder="Сумма ₽"
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInvoice()}
                autoFocus
              />
              <Button onClick={handleInvoice} className="w-full" size="sm">Выставить</Button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={payOpen} onOpenChange={setPayOpen}>
          <PopoverTrigger asChild>
            <Button className="flex-1 h-12 text-base quick-action-btn" variant="outline" disabled={unpaidInvoices.length === 0}>
              <CreditCard className="w-5 h-5 mr-2" /> Оплата
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-2">Выберите оплаченный счёт:</p>
              {unpaidInvoices.slice(0, 10).map(inv => (
                <Button
                  key={inv.id}
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => { quickPayInvoice(inv.id); setPayOpen(false); }}
                >
                  <span>{inv.amount.toLocaleString()} ₽</span>
                  <span className="text-xs text-muted-foreground">{new Date(inv.issuedAt).toLocaleDateString('ru-RU')}</span>
                </Button>
              ))}
              {unpaidInvoices.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Нет неоплаченных счетов</p>}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Momentum bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Sales Momentum</span>
          <span className={isMomentumActive ? 'text-accent font-bold' : 'text-muted-foreground'}>
            {isMomentumActive ? '🔥 BOOST x1.5' : `${momentumPct}%`}
          </span>
        </div>
        <div className="momentum-bar">
          <motion.div
            className={`momentum-bar-fill ${isMomentumActive ? 'momentum-active' : ''}`}
            animate={{ width: `${momentumPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
