import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Shield, Users } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUpAsLeader } = useAuth();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(form.email, form.password);
    if (error) toast.error(error);
    setLoading(false);
  }

  async function handleRegisterLeader(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Укажите имя'); return; }
    setLoading(true);
    const { error } = await signUpAsLeader(form.email, form.password, form.name);
    if (error) toast.error(error);
    else toast.success('Регистрация успешна! Проверьте email для подтверждения.');
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">SalesForce</h1>
          <p className="text-muted-foreground mt-1">Система управления продажами</p>
        </div>

        <div className="widget-card">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="login" className="flex-1">Вход</TabsTrigger>
              <TabsTrigger value="register" className="flex-1">Регистрация руководителя</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <Label>Пароль</Label>
                  <Input type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Вход...' : 'Войти'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegisterLeader} className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Регистрация руководителя отдела продаж. Менеджеры регистрируются по инвайт-ссылке.
                  </p>
                </div>
                <div>
                  <Label>Имя</Label>
                  <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <Label>Пароль</Label>
                  <Input type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Менеджеры регистрируются по ссылке-приглашению от руководителя</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
