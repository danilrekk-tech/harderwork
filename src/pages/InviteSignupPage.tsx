import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

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
        <div className="widget-card max-w-md text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h2 className="font-display text-xl font-bold mb-2">Проверьте почту</h2>
          <p className="text-muted-foreground text-sm">Мы отправили ссылку для подтверждения на ваш email. После подтверждения вы сможете войти в систему.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">SalesForce</h1>
          <p className="text-muted-foreground mt-1">Регистрация менеджера</p>
        </div>
        <div className="widget-card">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50 mb-6">
            <UserPlus className="w-5 h-5 text-primary" />
            <span className="text-sm">Вы приглашены как менеджер по продажам</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
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
        </div>
      </motion.div>
    </div>
  );
}
