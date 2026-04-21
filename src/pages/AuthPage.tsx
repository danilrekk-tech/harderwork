import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Shield, Users, Sparkles, TrendingUp, Trophy, Zap } from 'lucide-react';
import heroAuth from '@/assets/hero-auth.jpg';
import crystals from '@/assets/crystals.png';

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations with hero image */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={heroAuth}
          alt=""
          aria-hidden="true"
          className="absolute -top-40 -right-40 w-[700px] h-[700px] object-cover opacity-40 dark:opacity-25 blur-2xl"
          width={1280}
          height={1280}
        />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl" />
        <img
          src={crystals}
          alt=""
          aria-hidden="true"
          className="absolute bottom-10 right-10 w-32 h-32 opacity-30 hidden md:block"
          width={768}
          height={768}
          loading="lazy"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">MegaGroup Team</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">Платформа геймификации продаж</p>
        </div>

        {/* Features strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-6 mb-6"
        >
          {[
            { icon: TrendingUp, label: 'Аналитика' },
            { icon: Trophy, label: 'Достижения' },
            { icon: Zap, label: 'Геймификация' },
          ].map((feat, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
                <feat.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{feat.label}</span>
            </div>
          ))}
        </motion.div>

        <div className="widget-card premium-glow">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full mb-6 h-11">
              <TabsTrigger value="login" className="flex-1 text-sm">Вход</TabsTrigger>
              <TabsTrigger value="register" className="flex-1 text-sm">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Email</Label>
                  <Input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Пароль</Label>
                  <Input type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="h-11" />
                </div>
                <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={loading}>
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                  ) : 'Войти'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegisterLeader} className="space-y-4">
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/15">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Регистрация руководителя отдела продаж. Менеджеры регистрируются по инвайт-ссылке.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Имя</Label>
                  <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ваше имя" className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Email</Label>
                  <Input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Пароль</Label>
                  <Input type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Мин. 6 символов" className="h-11" />
                </div>
                <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={loading}>
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                  ) : 'Зарегистрироваться'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>Менеджеры регистрируются по ссылке-приглашению от руководителя</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/60 mt-6">
          © {new Date().getFullYear()} MegaGroup Team. Все права защищены.
        </p>
      </motion.div>
    </div>
  );
}
