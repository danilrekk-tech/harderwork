import { useApp } from '@/context/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Link, Trash2, Moon, Sun, Upload, BookOpen, Package } from 'lucide-react';

const DAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

interface Invite {
  id: string;
  code: string;
  expires_at: string;
  used_by: string | null;
  created_at: string;
}

interface OwnedBoost {
  boost_id: string;
  name: string;
  icon: string;
  effect: string;
  description: string;
}

export default function SettingsPage() {
  const { state, updateState } = useApp();
  const { role, user, profileName } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  // Leader plan settings
  const [planType, setPlanType] = useState('amount');
  const [planTarget, setPlanTarget] = useState(500000);
  const [planSaved, setPlanSaved] = useState(false);
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Boost inventory for managers
  const [ownedBoosts, setOwnedBoosts] = useState<OwnedBoost[]>([]);
  // Active boost themes
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('boost_theme') || '');

  useEffect(() => {
    if (role === 'leader') {
      loadInvites();
      loadPlan();
    }
    if (role !== 'leader' && user) {
      loadOwnedBoosts();
    }
  }, [role, user]);

  async function loadOwnedBoosts() {
    if (!user) return;
    const { data: purchases } = await supabase
      .from('user_boosts')
      .select('boost_id')
      .eq('user_id', user.id);
    if (!purchases?.length) return;

    const boostIds = purchases.map(p => p.boost_id);
    const { data: boosts } = await supabase
      .from('boost_items')
      .select('id, name, icon, effect, description')
      .in('id', boostIds);
    
    if (boosts) {
      setOwnedBoosts(boosts.map(b => ({
        boost_id: b.id,
        name: b.name,
        icon: b.icon,
        effect: b.effect,
        description: b.description,
      })));
    }
  }

  function toggleBoostTheme(boostId: string) {
    if (activeTheme === boostId) {
      setActiveTheme('');
      localStorage.removeItem('boost_theme');
      document.documentElement.removeAttribute('data-boost-theme');
      toast.success('Специальная тема отключена');
    } else {
      setActiveTheme(boostId);
      localStorage.setItem('boost_theme', boostId);
      document.documentElement.setAttribute('data-boost-theme', 'special');
      toast.success('Специальная тема активирована!');
    }
  }

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

  async function loadPlan() {
    const { data } = await supabase
      .from('team_plan')
      .select('*')
      .eq('month', currentMonth)
      .maybeSingle();
    if (data) {
      setPlanType((data as any).plan_type);
      setPlanTarget(Number((data as any).plan_target));
      setPlanSaved(true);
    }
  }

  async function savePlan() {
    if (!user) return;
    const { error } = await supabase
      .from('team_plan')
      .upsert({
        created_by: user.id,
        plan_type: planType,
        plan_target: planTarget,
        month: currentMonth,
      } as any, { onConflict: 'created_by,month' });
    if (error) toast.error('Ошибка сохранения плана');
    else { toast.success('План сохранён'); setPlanSaved(true); }
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

  const themeBoosts = ownedBoosts.filter(b => b.effect === 'visual_theme');
  const consumableBoosts = ownedBoosts.filter(b => ['extra_break', 'skip_task'].includes(b.effect));

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">⚙️ Настройки</h1>

      <div className="space-y-6">
        {/* Profile */}
        <div className="widget-card">
          <h2 className="font-display font-semibold text-foreground mb-4">Профиль</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary">
              {(profileName || state.profile.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-foreground">{profileName || state.profile.name}</div>
              <div className="text-sm text-muted-foreground">
                {role === 'leader' ? '🛡️ Руководитель отдела' : '📊 Менеджер по продажам'}
              </div>
              {role !== 'leader' && (
                <div className="text-xs text-accent mt-0.5">Ур. {state.profile.level} • {state.profile.totalXpEarned} XP</div>
              )}
            </div>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Имя</Label>
            <Input value={profileName || state.profile.name} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground mt-1">Имя задаётся при регистрации</p>
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

          {/* Theme boosts */}
          {themeBoosts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-foreground mb-2">🎨 Специальные темы</h3>
              {themeBoosts.map(b => (
                <div key={b.boost_id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{b.icon}</span>
                    <span className="text-sm text-foreground">{b.name}</span>
                  </div>
                  <Switch
                    checked={activeTheme === b.boost_id}
                    onCheckedChange={() => toggleBoostTheme(b.boost_id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Boost Inventory (Manager only) */}
        {role !== 'leader' && consumableBoosts.length > 0 && (
          <div className="widget-card">
            <h2 className="font-display font-semibold text-foreground mb-4">
              <Package className="w-5 h-5 inline mr-2" />Инвентарь
            </h2>
            <div className="space-y-2">
              {consumableBoosts.map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <span className="text-xl">{b.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{b.name}</div>
                    <div className="text-xs text-muted-foreground">{b.description}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toast.success(`${b.name} активирован!`)}>
                    Использовать
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leader: Monthly Plan */}
        {role === 'leader' && (
          <div className="widget-card">
            <h2 className="font-display font-semibold text-foreground mb-4">📋 План на {new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</h2>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Select value={planType} onValueChange={v => { setPlanType(v); setPlanSaved(false); }}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">По сумме (₽)</SelectItem>
                    <SelectItem value="count">По кол-ву</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" value={planTarget} onChange={e => { setPlanTarget(Number(e.target.value)); setPlanSaved(false); }} />
                <Button size="sm" onClick={savePlan} disabled={planSaved} className="shrink-0">
                  {planSaved ? '✓ Сохранён' : 'Сохранить'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Этот план будет виден всем менеджерам</p>
            </div>
          </div>
        )}

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

        {/* Manager-only: Work Schedule */}
        {role !== 'leader' && (
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
        )}

        {/* Knowledge Base link */}
        <div className="widget-card">
          <a href="/knowledge" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
            <BookOpen className="w-5 h-5" />
            <div>
              <div className="font-display font-semibold">База знаний</div>
              <div className="text-xs text-muted-foreground">Интерактивный гайд по всем функциям</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
