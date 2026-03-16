import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function SkillsWidget() {
  const { state, allocateSkillPoint } = useApp();
  const { skills } = state;

  const skillList = [
    { key: 'closing' as const, name: 'Закрытие сделок', icon: '💰', desc: '+5% XP за оплаты', level: skills.closing },
    { key: 'processing' as const, name: 'Обработка клиентов', icon: '👥', desc: '+5% XP за клиентов', level: skills.processing },
    { key: 'planning' as const, name: 'Планирование', icon: '📊', desc: '+5% XP за счета', level: skills.planning },
  ];

  function handleAllocate(skill: 'closing' | 'processing' | 'planning') {
    if (skills.availablePoints <= 0) { toast.error('Нет доступных очков навыков!'); return; }
    if (skills[skill] >= 10) { toast.error('Навык на максимуме!'); return; }
    allocateSkillPoint(skill);
    toast.success('Навык прокачан!');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-foreground">🧠 Навыки</h3>
        <span className="text-xs font-semibold text-accent">
          {skills.availablePoints > 0 ? `${skills.availablePoints} очков` : 'Нет очков'}
        </span>
      </div>
      <div className="space-y-3">
        {skillList.map(skill => (
          <div key={skill.key} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{skill.icon} {skill.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{skill.level}/10</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  disabled={skills.availablePoints <= 0 || skill.level >= 10}
                  onClick={() => handleAllocate(skill.key)}
                >
                  +
                </Button>
              </div>
            </div>
            <Progress value={skill.level * 10} className="h-1.5" />
            <p className="text-xs text-muted-foreground">{skill.desc} (текущий бонус: +{skill.level * 5}%)</p>
          </div>
        ))}
      </div>
    </div>
  );
}
