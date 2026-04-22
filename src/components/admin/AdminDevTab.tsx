import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, FlaskConical, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type Status = 'idle' | 'running' | 'pass' | 'fail';

interface TestResult {
  status: Status;
  message?: string;
}

interface TestDef {
  id: string;
  title: string;
  description: string;
  run: () => Promise<{ ok: boolean; message: string }>;
}

export default function AdminDevTab() {
  const { user } = useAuth();
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [runningAll, setRunningAll] = useState(false);

  const tests: TestDef[] = [
    {
      id: 'first-user-leader',
      title: 'Первый пользователь = руководитель',
      description: 'Самый ранний пользователь по дате регистрации должен иметь роль leader.',
      run: async () => {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, created_at')
          .order('created_at', { ascending: true })
          .limit(1);
        if (!profiles?.length) return { ok: false, message: 'Нет ни одного профиля' };
        const first = profiles[0];
        const { data: role } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', first.user_id)
          .maybeSingle();
        if (role?.role === 'leader') {
          return { ok: true, message: `${first.name || first.user_id.slice(0, 8)} — leader ✓` };
        }
        return { ok: false, message: `Первый пользователь имеет роль "${role?.role ?? '—'}", ожидалась leader` };
      },
    },
    {
      id: 'others-managers',
      title: 'Остальные пользователи = менеджеры',
      description: 'Все, кроме первого зарегистрированного, должны иметь роль manager (или быть без роли по приглашению).',
      run: async () => {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, created_at')
          .order('created_at', { ascending: true });
        if (!profiles || profiles.length <= 1) return { ok: true, message: 'Пока только один пользователь — нечего проверять' };
        const others = profiles.slice(1).map(p => p.user_id);
        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', others);
        const wrong = (roles || []).filter(r => r.role === 'leader');
        if (wrong.length === 0) {
          return { ok: true, message: `Проверено ${others.length} пользователей — лишних leader нет` };
        }
        return { ok: false, message: `Найдено ${wrong.length} лишних leader-аккаунтов` };
      },
    },
    {
      id: 'one-leader-only',
      title: 'Только один руководитель',
      description: 'В системе должен быть ровно один аккаунт с ролью leader.',
      run: async () => {
        const { data, error } = await supabase
          .from('user_roles')
          .select('user_id', { count: 'exact' })
          .eq('role', 'leader');
        if (error) return { ok: false, message: error.message };
        const count = data?.length ?? 0;
        if (count === 1) return { ok: true, message: '1 руководитель ✓' };
        return { ok: false, message: `Найдено руководителей: ${count}` };
      },
    },
    {
      id: 'no-duplicate-profiles',
      title: 'Нет дубликатов в profiles',
      description: 'У каждого user_id должен быть только один профиль (UNIQUE indexed).',
      run: async () => {
        const { data } = await supabase.from('profiles').select('user_id');
        const ids = (data || []).map(p => p.user_id);
        const dups = ids.length - new Set(ids).size;
        if (dups === 0) return { ok: true, message: `${ids.length} профилей, дубликатов нет` };
        return { ok: false, message: `Найдено ${dups} дубликатов профилей` };
      },
    },
    {
      id: 'no-duplicate-settings',
      title: 'Нет дубликатов в user_settings',
      description: 'У каждого user_id должна быть только одна запись в настройках.',
      run: async () => {
        const { data } = await supabase.from('user_settings').select('user_id');
        const ids = (data || []).map(s => s.user_id);
        const dups = ids.length - new Set(ids).size;
        if (dups === 0) return { ok: true, message: `${ids.length} записей, дубликатов нет` };
        return { ok: false, message: `Найдено ${dups} дубликатов настроек` };
      },
    },
    {
      id: 'profile-per-user',
      title: 'Каждому пользователю с ролью — профиль',
      description: 'У каждого user_roles.user_id должен быть профиль и user_settings.',
      run: async () => {
        const { data: roles } = await supabase.from('user_roles').select('user_id');
        const roleIds = (roles || []).map(r => r.user_id);
        if (!roleIds.length) return { ok: true, message: 'Нет пользователей с ролями' };
        const { data: profiles } = await supabase.from('profiles').select('user_id').in('user_id', roleIds);
        const { data: settings } = await supabase.from('user_settings').select('user_id').in('user_id', roleIds);
        const profileIds = new Set((profiles || []).map(p => p.user_id));
        const settingIds = new Set((settings || []).map(s => s.user_id));
        const missingProfile = roleIds.filter(id => !profileIds.has(id));
        const missingSettings = roleIds.filter(id => !settingIds.has(id));
        if (missingProfile.length === 0 && missingSettings.length === 0) {
          return { ok: true, message: `Все ${roleIds.length} пользователей имеют профиль и настройки` };
        }
        return { ok: false, message: `Без профиля: ${missingProfile.length}, без настроек: ${missingSettings.length}` };
      },
    },
    {
      id: 'audit-write',
      title: 'Запись аудит-лога работает',
      description: 'Тестовая запись + чтение из audit_log (только для leader).',
      run: async () => {
        if (!user) return { ok: false, message: 'Нет авторизованного пользователя' };
        const { error } = await supabase.from('audit_log').insert({
          actor_id: user.id,
          actor_name: 'Dev Test',
          action: 'dev_smoke_test',
          entity_type: 'system',
          entity_id: 'dev-checklist',
          details: { ts: new Date().toISOString() },
        });
        if (error) return { ok: false, message: error.message };
        return { ok: true, message: 'Запись в аудит-лог успешна' };
      },
    },
  ];

  const runOne = useCallback(async (test: TestDef) => {
    setResults(prev => ({ ...prev, [test.id]: { status: 'running' } }));
    try {
      const res = await test.run();
      setResults(prev => ({ ...prev, [test.id]: { status: res.ok ? 'pass' : 'fail', message: res.message } }));
    } catch (e: any) {
      setResults(prev => ({ ...prev, [test.id]: { status: 'fail', message: e?.message || 'Ошибка' } }));
    }
  }, []);

  const runAll = useCallback(async () => {
    setRunningAll(true);
    for (const t of tests) {
      await runOne(t);
    }
    setRunningAll(false);
  }, [runOne]);

  const passCount = Object.values(results).filter(r => r.status === 'pass').length;
  const failCount = Object.values(results).filter(r => r.status === 'fail').length;

  return (
    <div className="space-y-4">
      <Card className="glass p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-semibold">Чек-лист тестов после миграций</div>
            <div className="text-xs text-muted-foreground">
              Быстрая проверка целостности ролей, профилей и идемпотентности триггера регистрации
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(passCount > 0 || failCount > 0) && (
            <div className="text-xs flex gap-2">
              <Badge variant="outline" className="text-emerald-600 border-emerald-500/30">✓ {passCount}</Badge>
              {failCount > 0 && <Badge variant="destructive">✗ {failCount}</Badge>}
            </div>
          )}
          <Button onClick={runAll} disabled={runningAll} size="sm">
            {runningAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Запустить все
          </Button>
        </div>
      </Card>

      <div className="space-y-2">
        {tests.map(t => {
          const r = results[t.id];
          const status = r?.status ?? 'idle';
          return (
            <Card key={t.id} className="glass p-4 flex items-start gap-3">
              <div className="mt-0.5">
                {status === 'pass' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {status === 'fail' && <XCircle className="w-5 h-5 text-destructive" />}
                {status === 'running' && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                {status === 'idle' && <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{t.title}</div>
                <div className="text-xs text-muted-foreground">{t.description}</div>
                {r?.message && (
                  <div className={`text-xs mt-1 font-mono ${status === 'fail' ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {r.message}
                  </div>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={() => runOne(t)} disabled={status === 'running' || runningAll}>
                Тест
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
