import { useApp } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const DAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export default function SettingsPage() {
  const { state, updateState } = useApp();

  function toggleWorkDay(day: number) {
    const days = state.workSchedule.workDays.includes(day)
      ? state.workSchedule.workDays.filter(d => d !== day)
      : [...state.workSchedule.workDays, day];
    updateState(() => ({ workSchedule: { ...state.workSchedule, workDays: days } }));
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">⚙️ Настройки</h1>

      <div className="space-y-6">
        {/* Profile */}
        <div className="widget-card">
          <h2 className="font-display font-semibold text-foreground mb-4">Профиль</h2>
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-muted-foreground">Имя</Label>
              <Input
                value={state.profile.name}
                onChange={e => updateState(() => ({ profile: { ...state.profile, name: e.target.value } }))}
              />
            </div>
          </div>
        </div>

        {/* Plan Settings */}
        <div className="widget-card">
          <h2 className="font-display font-semibold text-foreground mb-4">План продаж</h2>
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-muted-foreground">Тип плана</Label>
              <Select
                value={state.planSettings.type}
                onValueChange={v => updateState(() => ({ planSettings: { ...state.planSettings, type: v as 'amount' | 'count' } }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">По сумме (₽)</SelectItem>
                  <SelectItem value="count">По количеству счетов</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Цель</Label>
              <Input
                type="number"
                value={state.planSettings.target}
                onChange={e => updateState(() => ({ planSettings: { ...state.planSettings, target: Number(e.target.value) } }))}
              />
            </div>
          </div>
        </div>

        {/* Work Schedule */}
        <div className="widget-card">
          <h2 className="font-display font-semibold text-foreground mb-4">Рабочее расписание</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Рабочие дни</Label>
              <div className="flex gap-2 flex-wrap">
                {DAY_LABELS.map((label, i) => (
                  <Button
                    key={i}
                    variant={state.workSchedule.workDays.includes(i) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleWorkDay(i)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Начало смены</Label>
                <Input
                  type="time"
                  value={state.workSchedule.startTime}
                  onChange={e => updateState(() => ({ workSchedule: { ...state.workSchedule, startTime: e.target.value } }))}
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Конец смены</Label>
                <Input
                  type="time"
                  value={state.workSchedule.endTime}
                  onChange={e => updateState(() => ({ workSchedule: { ...state.workSchedule, endTime: e.target.value } }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Mode */}
        <div className="widget-card">
          <h2 className="font-display font-semibold text-foreground mb-4">Администратор</h2>
          <div className="flex items-center gap-3">
            <Switch
              checked={state.isAdmin}
              onCheckedChange={v => {
                updateState(() => ({ isAdmin: v }));
                toast.success(v ? 'Режим администратора включён' : 'Режим администратора отключён');
              }}
            />
            <Label className="text-sm">Режим администратора</Label>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Открывает расширенные настройки и управление лидербордом</p>
        </div>

        {/* Reset */}
        <div className="widget-card">
          <h2 className="font-display font-semibold text-foreground mb-4">Данные</h2>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Сбросить все данные?')) {
                localStorage.removeItem('sales_app_state');
                window.location.reload();
              }
            }}
          >
            Сбросить данные
          </Button>
        </div>
      </div>
    </div>
  );
}
