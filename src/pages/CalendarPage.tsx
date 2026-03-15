import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Phone, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Reminder } from '@/types';

const DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

export default function CalendarPage() {
  const { state, addReminder, completeReminder } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [form, setForm] = useState({ clientId: '', clientTime: '', timezoneOffset: '0', reason: '', amount: '' });

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [currentMonth]);

  const remindersByDay = useMemo(() => {
    const map: Record<number, Reminder[]> = {};
    state.reminders.forEach(r => {
      const d = new Date(r.myTime);
      if (d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear()) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(r);
      }
    });
    return map;
  }, [state.reminders, currentMonth]);

  function handleSubmit() {
    if (!form.clientTime || !form.reason) return;
    const clientDate = new Date(form.clientTime);
    const offsetHours = Number(form.timezoneOffset);
    const myDate = new Date(clientDate.getTime() - offsetHours * 3600000);

    const reminder: Reminder = {
      id: crypto.randomUUID(),
      clientId: form.clientId,
      clientTimezone: `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`,
      clientTime: clientDate.toISOString(),
      myTime: myDate.toISOString(),
      reason: form.reason,
      amount: form.amount ? Number(form.amount) : undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    addReminder(reminder);
    setForm({ clientId: '', clientTime: '', timezoneOffset: '0', reason: '', amount: '' });
    setDialogOpen(false);
  }

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();

  const pendingReminders = state.reminders.filter(r => !r.completed).sort((a, b) => new Date(a.myTime).getTime() - new Date(b.myTime).getTime());

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">📅 Календарь</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-1" /> Напоминание</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Новое напоминание</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <Select value={form.clientId} onValueChange={v => setForm(p => ({ ...p, clientId: v }))}>
                <SelectTrigger><SelectValue placeholder="Клиент" /></SelectTrigger>
                <SelectContent>
                  {state.clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Время клиента</label>
                <Input type="datetime-local" value={form.clientTime} onChange={e => setForm(p => ({ ...p, clientTime: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Разница во времени (часы)</label>
                <Input type="number" placeholder="Например: 3 (клиент UTC+3)" value={form.timezoneOffset} onChange={e => setForm(p => ({ ...p, timezoneOffset: e.target.value }))} />
              </div>
              <Input placeholder="Причина звонка *" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
              <Input placeholder="Сумма сделки" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
              <Button onClick={handleSubmit} className="w-full">Создать</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 widget-card">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>←</Button>
            <h2 className="font-display font-semibold text-foreground">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>→</Button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative ${
                  day === null ? '' :
                  isToday(day) ? 'bg-primary text-primary-foreground font-bold' :
                  'hover:bg-muted cursor-pointer text-foreground'
                }`}
              >
                {day}
                {day && remindersByDay[day] && (
                  <div className="flex gap-0.5 mt-0.5">
                    {remindersByDay[day].slice(0, 3).map((_, ri) => (
                      <div key={ri} className="w-1.5 h-1.5 rounded-full bg-accent" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div>
          <h3 className="font-display font-semibold text-foreground mb-3">
            <Phone className="w-4 h-4 inline mr-1" /> На перезвон ({pendingReminders.length})
          </h3>
          <div className="space-y-2">
            {pendingReminders.slice(0, 10).map((r, i) => {
              const client = state.clients.find(c => c.id === r.clientId);
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="widget-card p-3"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {client?.name || 'Клиент'}
                      </div>
                      <div className="text-xs text-muted-foreground">{r.reason}</div>
                      {r.amount && <div className="text-xs font-medium text-foreground">{r.amount.toLocaleString()} ₽</div>}
                      <div className="text-xs text-muted-foreground mt-1">
                        🕐 {new Date(r.myTime).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => completeReminder(r.id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
            {pendingReminders.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">Нет запланированных звонков</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
