import DailyTasksWidget from '@/components/widgets/DailyTasksWidget';

export default function DailyTasksPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">📋 Ежедневные задачи</h1>
      <p className="text-muted-foreground text-sm mb-4">Выполняйте ежедневные задачи для получения XP и поддержания серии.</p>
      <div className="widget-card">
        <DailyTasksWidget />
      </div>
    </div>
  );
}
