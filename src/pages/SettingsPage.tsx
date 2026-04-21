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
import { Copy, Link, Trash2, Moon, Sun, Package, Settings, Palette, Clock, BookOpen, UserCircle, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme, setTheme } = useTheme();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [planType, setPlanType] = useState('amount');
  const [planTarget, setPlanTarget] = useState(500000);
  const [planSaved, setPlanSaved] = useState(false);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [ownedBoosts, setOwnedBoosts] = useState<OwnedBoost[]>([]);
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('boost_theme') || '');

  useEffect(() => {
    if (role === 'leader') { loadInvites(); loadPlan(); }
    if (role !== 'leader' && user) { loadOwnedBoosts(); }
  }, [role, user]);

  async function loadOwnedBoosts() {
    if (!user) return;
    const { data: purchases } = await supabase.from('user_boosts').select('boost_id').eq('user_id', user.id);
    if (!purchases?.length) return;
    const boostIds = purchases.map(p => p.boost_id);
    const { data: boosts } = await supabase.from('boost_items').select('id, name, icon, effect, description').in('id', boostIds);
    if (boosts) setOwnedBoosts(boosts.map(b => ({ boost_id: b.id, name: b.name, icon: b.icon, effect: b.effect, description: b.description })));
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

  // Theme handled via ThemeContext (light/dark/system)


  async function loadInvites() {
    const { data } = await supabase.from('invites').select('*').order('created_at', { ascending: false });
    if (data) setInvites(data as unknown as Invite[]);
  }

  async function loadPlan() {
    const { data } = await supabase.from('team_plan').select('*').eq('month', currentMonth).maybeSingle();
    if (data) { setPlanType((data as any).plan_type); setPlanTarget(Number((data as any).plan_target)); setPlanSaved(true); }
  }

  async function savePlan() {
    if (!user) return;
    const { error } = await supabase.from('team_plan').upsert({
      created_by: user.id, plan_type: planType, plan_target: planTarget, month: currentMonth,
    } as any, { onConflict: 'created_by,month' });
    if (error) toast.error('Ошибка сохранения плана');
    else { toast.success('План сохранён'); setPlanSaved(true); }
  }

  async function createInvite() {
    if (!user) return;
    setLoadingInvite(true);
    const code = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
    const { error } = await supabase.from('invites').insert({
      code, created_by: user.id, expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    });
    if (error) toast.error('Ошибка создания приглашения');
    else { toast.success('Приглашение создано'); loadInvites(); }
    setLoadingInvite(false);
  }

  function copyInviteLink(code: string) {
    navigator.clipboard.writeText(`${window.location.origin}/invite?code=${code}`);
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
  const consumableBoosts = ownedBoosts.filter(b => ['extra_break', 'skip_task', 'early_leave'].includes(b.effect));
  const displayName = profileName || state.profile.name || 'Пользователь';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
        <Settings className="w-7 h-7 text-primary" />
        Настройки
      </h1>

      <div className="space-y-5">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="widget-card">
          <div className="flex items-center gap-2 mb-4">
            <UserCircle className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">Профиль</h2>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-display font-semibold text-foreground text-lg">{displayName}</div>
              <div className="text-sm text-muted-foreground">
                {role === 'leader' ? '🛡️ Руководитель отдела' : '📊 Менеджер по продажам'}
              </div>
              {role !== 'leader' && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="level-badge text-xs">Ур. {state.profile.level}</span>
                  <span className="text-xs text-accent font-semibold">{state.profile.totalXpEarned} XP</span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Имя</Label>
            <Input value={displayName} disabled className="bg-muted/50 h-10" />
            <p className="text-[11px] text-muted-foreground">Имя задаётся при регистрации</p>
          </div>
        </motion.div>

        {/* Theme */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="widget-card">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">Оформление</h2>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-accent" />}
              <div>
                <div className="text-sm font-medium text-foreground">{darkMode ? 'Тёмная тема' : 'Светлая тема'}</div>
                <div className="text-[11px] text-muted-foreground">Переключить оформление</div>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>

          {themeBoosts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-1.5">
                <Palette className="w-4 h-4" /> Специальные темы
              </h3>
              <div className="space-y-2">
                {themeBoosts.map(b => (
                  <div key={b.boost_id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{b.icon}</span>
                      <div>
                        <span className="text-sm font-medium text-foreground">{b.name}</span>
                        <p className="text-[11px] text-muted-foreground">{b.description}</p>
                      </div>
                    </div>
                    <Switch checked={activeTheme === b.boost_id} onCheckedChange={() => toggleBoostTheme(b.boost_id)} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Inventory (Manager) */}
        {role !== 'leader' && consumableBoosts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="widget-card">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">Инвентарь</h2>
            </div>
            <div className="space-y-2">
              {consumableBoosts.map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <span className="text-xl">{b.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{b.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{b.description}</div>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast.success(`${b.name} активирован!`)}>
                    Использовать
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Leader: Plan */}
        {role === 'leader' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="widget-card">
            <h2 className="font-display font-semibold text-foreground mb-4">📋 План на {new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</h2>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Select value={planType} onValueChange={v => { setPlanType(v); setPlanSaved(false); }}>
                  <SelectTrigger className="w-36 h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">По сумме (₽)</SelectItem>
                    <SelectItem value="count">По кол-ву</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" value={planTarget} onChange={e => { setPlanTarget(Number(e.target.value)); setPlanSaved(false); }} className="h-10" />
                <Button size="sm" onClick={savePlan} disabled={planSaved} className="shrink-0 h-10 px-4">
                  {planSaved ? '✓ Сохранён' : 'Сохранить'}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">Этот план будет виден всем менеджерам</p>
            </div>
          </motion.div>
        )}

        {/* Leader: Invites */}
        {role === 'leader' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="widget-card">
            <h2 className="font-display font-semibold text-foreground mb-3">📨 Приглашения менеджеров</h2>
            <p className="text-xs text-muted-foreground mb-4">Создайте инвайт-ссылку для регистрации нового менеджера. Действует 7 дней.</p>
            <Button onClick={createInvite} disabled={loadingInvite} size="sm" className="mb-4 h-9">
              <Link className="w-4 h-4 mr-1.5" /> Создать приглашение
            </Button>
            {invites.length > 0 && (
              <div className="space-y-2">
                {invites.map(inv => (
                  <div key={inv.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 text-sm">
                    <code className="flex-1 text-xs font-mono truncate text-muted-foreground">{inv.code}</code>
                    {inv.used_by ? (
                      <span className="text-[10px] font-medium text-primary px-2 py-0.5 rounded-full bg-primary/10">Использовано</span>
                    ) : new Date(inv.expires_at) < new Date() ? (
                      <span className="text-[10px] font-medium text-destructive px-2 py-0.5 rounded-full bg-destructive/10">Истекло</span>
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
          </motion.div>
        )}

        {/* Manager: Work Schedule */}
        {role !== 'leader' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="widget-card">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">Рабочее расписание</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Рабочие дни</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {DAY_LABELS.map((label, i) => (
                    <Button key={i} variant={state.workSchedule.workDays.includes(i) ? 'default' : 'outline'} size="sm" onClick={() => toggleWorkDay(i)} className="h-9 w-10 text-xs">
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Начало смены</Label>
                  <Input type="time" value={state.workSchedule.startTime} onChange={e => updateState(() => ({ workSchedule: { ...state.workSchedule, startTime: e.target.value } }))} className="h-10" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Конец смены</Label>
                  <Input type="time" value={state.workSchedule.endTime} onChange={e => updateState(() => ({ workSchedule: { ...state.workSchedule, endTime: e.target.value } }))} className="h-10" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Knowledge Base */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="widget-card hover:border-primary/20 transition-colors cursor-pointer">
          <a href="/knowledge" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-display font-semibold text-sm">База знаний</div>
              <div className="text-[11px] text-muted-foreground">Интерактивный гайд по всем функциям</div>
            </div>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
