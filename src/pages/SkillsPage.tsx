import SkillsWidget from '@/components/widgets/SkillsWidget';

export default function SkillsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">🧠 Древо навыков</h1>
      <p className="text-muted-foreground text-sm mb-4">Прокачивайте навыки за очки, которые получаете при повышении уровня.</p>
      <div className="widget-card">
        <SkillsWidget />
      </div>
    </div>
  );
}
