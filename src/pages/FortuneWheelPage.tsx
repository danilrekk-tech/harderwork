import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Disc3, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

const SECTORS = [
  { label: '+25 XP', xp: 25, color: 'hsl(120 78% 38%)' },
  { label: '+50 XP', xp: 50, color: 'hsl(120 78% 50%)' },
  { label: '+100 XP', xp: 100, color: 'hsl(120 60% 30%)' },
  { label: '+10 XP', xp: 10, color: 'hsl(150 50% 45%)' },
  { label: '+200 XP', xp: 200, color: 'hsl(120 78% 28%)' },
  { label: '+5 XP', xp: 5, color: 'hsl(140 40% 50%)' },
  { label: '+500 XP 🎰', xp: 500, color: 'hsl(120 90% 35%)' },
  { label: '+15 XP', xp: 15, color: 'hsl(130 60% 42%)' },
];

export default function FortuneWheelPage() {
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState<typeof SECTORS[0] | null>(null);
  const [todaySpun, setTodaySpun] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase.from('fortune_wheel_spins').select('id').eq('user_id', user.id).gte('spun_at', today + 'T00:00:00');
      setTodaySpun((data?.length || 0) > 0);
    })();
  }, []);

  const spin = async () => {
    if (todaySpun || spinning) return;
    setSpinning(true);
    setResult(null);
    const idx = Math.floor(Math.random() * SECTORS.length);
    const target = 360 * 6 + (360 - (idx * 45) - 22.5);
    setAngle(target);
    await new Promise(r => setTimeout(r, 4500));
    const r = SECTORS[idx];
    setResult(r);
    setSpinning(false);
    setTodaySpun(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('fortune_wheel_spins').insert({ user_id: user.id, reward_xp: r.xp, reward_label: r.label });
      const { data: profile } = await supabase.from('profiles').select('xp, total_xp_earned').eq('user_id', user.id).maybeSingle();
      if (profile) {
        await supabase.from('profiles').update({
          xp: profile.xp + r.xp, total_xp_earned: profile.total_xp_earned + r.xp,
        }).eq('user_id', user.id);
      }
      toast.success(`Выиграно: ${r.label}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Disc3 className="w-5 h-5 text-primary" /></div>
        <div>
          <h1 className="page-title">Колесо удачи</h1>
          <p className="page-subtitle">1 крутка в день. Удачи!</p>
        </div>
      </div>

      <Card className="glass p-8 text-center">
        <div className="relative w-72 h-72 mx-auto mb-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary drop-shadow-md" />
          </div>
          <motion.svg
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-xl"
            animate={{ rotate: angle }}
            transition={{ duration: 4.5, ease: [0.17, 0.67, 0.12, 0.99] }}
          >
            {SECTORS.map((s, i) => {
              const startAngle = (i * 360) / SECTORS.length;
              const endAngle = ((i + 1) * 360) / SECTORS.length;
              const start = polar(100, startAngle);
              const end = polar(100, endAngle);
              const largeArc = endAngle - startAngle > 180 ? 1 : 0;
              const path = `M 100 100 L ${start.x} ${start.y} A 100 100 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
              const labelPos = polar(65, startAngle + 22.5);
              return (
                <g key={i}>
                  <path d={path} fill={s.color} stroke="white" strokeWidth="2" />
                  <text x={labelPos.x} y={labelPos.y} fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" dominantBaseline="middle"
                    transform={`rotate(${startAngle + 22.5 + 90}, ${labelPos.x}, ${labelPos.y})`}>
                    {s.label}
                  </text>
                </g>
              );
            })}
            <circle cx="100" cy="100" r="15" fill="white" stroke="hsl(var(--primary))" strokeWidth="3" />
          </motion.svg>
        </div>

        {result && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6">
            <Sparkles className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-display font-bold text-gradient">{result.label}</p>
          </motion.div>
        )}

        <Button onClick={spin} disabled={spinning || todaySpun} size="lg" className="quick-action-btn">
          {todaySpun ? 'Возвращайтесь завтра' : spinning ? 'Крутится...' : 'Крутить колесо'}
        </Button>
      </Card>
    </div>
  );
}

function polar(r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: 100 + r * Math.cos(rad), y: 100 + r * Math.sin(rad) };
}
