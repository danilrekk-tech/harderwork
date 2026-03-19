import { useApp } from '@/context/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Link, Trash2, Moon, Sun } from 'lucide-react';

const DAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

interface Invite {
  id: string;
  code: string;
  expires_at: string;
  used_by: string | null;
  created_at: string;
}

export default function SettingsPage() {
  const { state, updateState } = useApp();
  const { role, user, profileName } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (role === 'leader') loadInvites();
  }, [role]);

  function toggleDarkMode(enabled: boolean) {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  async function loadInvites() {
    const { data } = await supabase
      .from('invites')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setInvites(data as unknown as Invite[]);
  }

  async function createInvite() {
    if (!user) return;
    setLoadingInvite(true);
    const code = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
    const { error } = await supabase.from('invites').insert({
      code,
      created_by: user.id,
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    });
    if (error) toast.error('Ошибка создания приглашения');
    else {
      toast.success('Приглашение создано');
      loadInvites();
    }
    setLoadingInvite(false);
  }

  function copyInviteLink(code: string) {
    const url = `${window.location.origin}/invite?code=${code}`;
    navigator.clipboard.writeText(url);
    toast.success('Ссылка скопирована');
  }

  async function revokeInvite(id: string) {
    await supabase.from('invites').delete().eq('id', id);
    loadInvites();
    toast.success('Приглашение отозвано');
  }

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
              <Input value={profileName || state.profile.name} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">Имя задаётся при регистрации</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Роль</Label>
              <div className="text-sm font-medium text-foreground mt-1">
                {role === 'leader' ? '🛡️ Руководитель отдела' : '📊 Менеджер по продажам'}
              </div>
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="widget-card">
          <h2 className="font-display font-semibold text-foreground mb-4">Оформление</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
              <div>
                <div className="text-sm font-medium text-foreground">{darkMode ? 'Тёмная тема' : 'Светлая тема'}</div>
                <div className="text-xs text-muted-foreground">Переключить оформление</div>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>
        </div>

        {/* Invite Management (Leader only) */}
        {role === 'leader' && (
          <div className="widget-card">
            <h2 className="font-display font-semibold text-foreground mb-4">📨 Приглашения менеджеров</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Создайте инвайт-ссылку для регистрации нового менеджера. Ссылка действует 7 дней.
            </p>
            <Button onClick={createInvite} disabled={loadingInvite} size="sm" className="mb-4">
              <Link className="w-4 h-4 mr-1" /> Создать приглашение
            </Button>
            {invites.length > 0 && (
              <div className="space-y-2">
                {invites.map(inv => (
                  <div key={inv.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
                    <code className="flex-1 text-xs truncate">{inv.code}</code>
                    {inv.used_by ? (
                      <span className="text-xs text-muted-foreground">Использовано</span>
                    ) : new Date(inv.expires_at) < new Date() ? (
                      <span className="text-xs text-destructive">Истекло</span>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyInviteLink(inv.code)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => revokeInvite(inv.id)}>
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Manager-only settings */}
        {role !== 'leader' && (
          <>
            {/* Work Schedule */}
            <div className="widget-card">
              <h2 className="font-display font-semibold text-foreground mb-4">Рабочее расписание</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Рабочие дни</Label>
                  <div className="flex gap-2 flex-wrap">
                    {DAY_LABELS.map((label, i) => (
                      <Button key={i} variant={state.workSchedule.workDays.includes(i) ? 'default' : 'outline'} size="sm" onClick={() => toggleWorkDay(i)}>
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Начало смены</Label>
                    <Input type="time" value={state.workSchedule.startTime} onChange={e => updateState(() => ({ workSchedule: { ...state.workSchedule, startTime: e.target.value } }))} />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Конец смены</Label>
                    <Input type="time" value={state.workSchedule.endTime} onChange={e => updateState(() => ({ workSchedule: { ...state.workSchedule, endTime: e.target.value } }))} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
