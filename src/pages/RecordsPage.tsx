import PersonalRecordsWidget from '@/components/widgets/PersonalRecordsWidget';

export default function RecordsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">🏅 Личные рекорды</h1>
      <p className="text-muted-foreground text-sm mb-4">Ваши лучшие результаты за все время. Побейте свои рекорды!</p>
      <div className="widget-card">
        <PersonalRecordsWidget />
      </div>
    </div>
  );
}
