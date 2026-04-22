import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Search, Crown, UserCog, Trash2, ShieldCheck, ShieldOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type Role = 'leader' | 'manager';

interface UserRow {
  user_id: string;
  name: string;
  level: number;
  total_xp_earned: number;
  created_at: string;
  role: Role | null;
}

export default function AdminUsersTab() {
  const { user, profileName } = useAuth();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name, level, total_xp_earned, created_at')
      .order('created_at', { ascending: true });

    const ids = (profiles || []).map(p => p.user_id);
    let rolesByUser: Record<string, Role> = {};
    if (ids.length) {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', ids);
      (roles || []).forEach(r => { rolesByUser[r.user_id] = r.role as Role; });
    }

    const merged: UserRow[] = (profiles || []).map(p => ({
      ...p,
      role: rolesByUser[p.user_id] ?? null,
    }));
    setRows(merged);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const writeAudit = async (action: string, entity_id: string, details: Record<string, any>) => {
    if (!user) return;
    await supabase.from('audit_log').insert({
      actor_id: user.id,
      actor_name: profileName || user.email || 'Руководитель',
      action,
      entity_type: 'user',
      entity_id,
      details,
    });
  };

  const setUserRole = async (row: UserRow, newRole: Role) => {
    if (row.role === newRole) return;
    setBusyId(row.user_id);

    // Удаляем старые роли пользователя и ставим новую (одна роль на пользователя)
    const { error: delErr } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', row.user_id);
    if (delErr) {
      toast({ title: 'Ошибка', description: delErr.message, variant: 'destructive' });
      setBusyId(null);
      return;
    }
    const { error: insErr } = await supabase
      .from('user_roles')
      .insert({ user_id: row.user_id, role: newRole });
    if (insErr) {
      toast({ title: 'Ошибка', description: insErr.message, variant: 'destructive' });
      setBusyId(null);
      return;
    }

    await writeAudit('change_role', row.user_id, {
      target_name: row.name,
      from: row.role,
      to: newRole,
    });

    toast({ title: 'Роль обновлена', description: `${row.name}: ${row.role ?? '—'} → ${newRole}` });
    setBusyId(null);
    load();
  };

  const removeUserData = async (row: UserRow) => {
    setBusyId(row.user_id);
    // Чистим таблицы, где есть user_id (удаление аккаунта auth.users требует service role)
    const tables = ['user_roles', 'profiles', 'user_settings', 'action_events', 'daily_tasks', 'reminders', 'penalties', 'user_achievements', 'user_boosts', 'mystery_boxes', 'fortune_wheel_spins', 'manager_kpi'] as const;
    for (const t of tables) {
      await supabase.from(t).delete().eq('user_id', row.user_id);
    }
    await writeAudit('delete_user_data', row.user_id, { target_name: row.name });
    toast({ title: 'Данные пользователя очищены', description: row.name });
    setBusyId(null);
    load();
  };

  const filtered = rows.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.user_id.includes(search)
  );

  const leadersCount = rows.filter(r => r.role === 'leader').length;
  const managersCount = rows.filter(r => r.role === 'manager').length;
  const noRoleCount = rows.filter(r => !r.role).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass p-4">
          <div className="text-xs text-muted-foreground">Всего</div>
          <div className="text-2xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-primary" />{rows.length}</div>
        </Card>
        <Card className="glass p-4">
          <div className="text-xs text-muted-foreground">Руководители</div>
          <div className="text-2xl font-bold flex items-center gap-2"><Crown className="w-5 h-5 text-amber-500" />{leadersCount}</div>
        </Card>
        <Card className="glass p-4">
          <div className="text-xs text-muted-foreground">Менеджеры</div>
          <div className="text-2xl font-bold flex items-center gap-2"><UserCog className="w-5 h-5 text-primary" />{managersCount}</div>
        </Card>
        <Card className="glass p-4">
          <div className="text-xs text-muted-foreground">Без роли</div>
          <div className="text-2xl font-bold flex items-center gap-2"><ShieldOff className="w-5 h-5 text-destructive" />{noRoleCount}</div>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Поиск по имени или ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>Обновить</Button>
      </div>

      <Card className="glass overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            Нет пользователей
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Уровень</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Регистрация</TableHead>
                <TableHead>Назначить роль</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => {
                const isMe = r.user_id === user?.id;
                return (
                  <TableRow key={r.user_id}>
                    <TableCell className="font-medium">
                      {r.name || '—'}
                      {isMe && <Badge variant="outline" className="ml-2 text-xs">Вы</Badge>}
                    </TableCell>
                    <TableCell>
                      {r.role === 'leader' ? (
                        <Badge className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/30"><Crown className="w-3 h-3 mr-1" />Руководитель</Badge>
                      ) : r.role === 'manager' ? (
                        <Badge variant="secondary"><UserCog className="w-3 h-3 mr-1" />Менеджер</Badge>
                      ) : (
                        <Badge variant="destructive">Без роли</Badge>
                      )}
                    </TableCell>
                    <TableCell>Ур. {r.level}</TableCell>
                    <TableCell className="text-accent font-medium">{r.total_xp_earned}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={r.role ?? ''}
                        onValueChange={(v) => setUserRole(r, v as Role)}
                        disabled={busyId === r.user_id || isMe}
                      >
                        <SelectTrigger className="w-[150px] h-8">
                          <SelectValue placeholder="Назначить..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="leader">🛡 Руководитель</SelectItem>
                          <SelectItem value="manager">📊 Менеджер</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={busyId === r.user_id || isMe} title="Очистить данные пользователя">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Очистить данные пользователя?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Будут удалены профиль, настройки, роль, события, задачи и другие данные пользователя <b>{r.name}</b>. Сам аккаунт авторизации не удаляется (это нужно делать в Cloud → Users). Действие необратимо.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeUserData(r)} className="bg-destructive hover:bg-destructive/90">
                              Очистить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <div className="text-xs text-muted-foreground flex items-start gap-2 px-1">
        <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          Назначение ролей логируется в раздел «Логи аудита». Самому себе менять роль нельзя — это защищает от случайной потери доступа.
        </span>
      </div>
    </div>
  );
}
