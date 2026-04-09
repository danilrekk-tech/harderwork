import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { UserPlus, Sparkles, Mail } from 'lucide-react';

export default function InviteSignupPage() {
  const { signUp, user } = useAuth();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('code') || '';
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [done, setDone] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode) { toast.error('Отсутствует код приглашения'); return; }
    if (!form.name.trim()) { toast.error('Укажите имя'); return; }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.name, inviteCode);
    if (error) toast.error(error);
    else {
      toast.success('Регистрация успешна! Проверьте email для подтверждения.');
      setDone(true);
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="widget-card max-w-md text-center premium-glow p-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2 text-foreground">Проверьте почту</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">Мы отправили ссылку для подтверждения на ваш email. После подтверждения вы сможете войти в систему.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-foreground">MegaGroup Team</h1>
          <p className="text-muted-foreground mt-1">Регистрация менеджера</p>
        </div>
        <div className="widget-card premium-glow">
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/15 mb-6">
            <UserPlus className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm text-foreground font-medium">Вы приглашены как менеджер по продажам</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </form>
        </div>
        <p className="text-center text-[11px] text-muted-foreground/60 mt-6">
          © {new Date().getFullYear()} MegaGroup Team
        </p>
      </motion.div>
    </div>
  );
}
