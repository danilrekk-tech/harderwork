import FocusSessionWidget from '@/components/widgets/FocusSessionWidget';

export default function FocusPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">🎯 Фокус-сессия</h1>
      <p className="text-muted-foreground text-sm mb-4">Режим помодоро: сосредоточьтесь на задачах и получайте бонус XP за каждое действие.</p>
      <div className="widget-card">
        <FocusSessionWidget />
      </div>
    </div>
  );
}
