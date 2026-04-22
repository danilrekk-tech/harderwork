import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, Drumstick, PawPrint } from 'lucide-react';
import { toast } from 'sonner';

const STAGES = ['🥚', '🐣', '🦊', '🐺', '🐲'];

export default function PetPage() {
  const { user } = useAuth();
  const [pet, setPet] = useState<any>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('pets').select('*').eq('user_id', user.id).maybeSingle();
    if (!data) {
      await supabase.from('pets').insert({ user_id: user.id });
      const { data: d2 } = await supabase.from('pets').select('*').eq('user_id', user.id).maybeSingle();
      setPet(d2);
    } else setPet(data);
  };
  useEffect(() => { load(); }, [user]);

  const feed = async () => {
    if (!pet) return;
    const newXp = pet.xp + 10;
    const newLvl = pet.level + (newXp >= 100 ? 1 : 0);
    const stage = Math.min(STAGES.length, Math.floor(newLvl / 3) + 1);
    await supabase.from('pets').update({ hunger: Math.min(100, pet.hunger + 20), happiness: Math.min(100, pet.happiness + 10), xp: newXp % 100, level: newLvl, evolution_stage: stage, last_fed_at: new Date().toISOString() }).eq('id', pet.id);
    toast.success('Питомец доволен! +10 XP');
    load();
  };

  if (!pet) return <div className="text-center p-8">Загрузка...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><PawPrint className="w-5 h-5 text-primary" /></div>
        <div><h1 className="page-title">Питомец</h1><p className="page-subtitle">Ухаживай за маскотом — он растёт вместе с тобой</p></div>
      </div>

      <Card className="p-8 glass text-center">
        <div className="text-9xl mb-4">{STAGES[pet.evolution_stage - 1]}</div>
        <h2 className="text-2xl font-bold">{pet.name}</h2>
        <p className="text-muted-foreground">Уровень {pet.level} · Стадия {pet.evolution_stage}</p>
        <Progress value={pet.xp} className="mt-4" />
        <p className="text-xs text-muted-foreground mt-1">{pet.xp}/100 XP до следующего уровня</p>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <div className="flex items-center gap-1 text-sm mb-1"><Heart className="w-4 h-4 text-red-500" />Счастье</div>
            <Progress value={pet.happiness} />
          </div>
          <div>
            <div className="flex items-center gap-1 text-sm mb-1"><Drumstick className="w-4 h-4 text-orange-500" />Сытость</div>
            <Progress value={pet.hunger} />
          </div>
        </div>

        <Button onClick={feed} className="mt-6" size="lg"><Drumstick className="w-4 h-4 mr-2" />Покормить</Button>
      </Card>
    </div>
  );
}
