import { useApp } from '@/context/AppContext';
import { Progress } from '@/components/ui/progress';

export default function DailyTasksWidget() {
  const { state } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const tasks = state.dailyTasks.filter(t => t.date === today);
  const completedCount = tasks.filter(t => t.completed).length;
  const icons = { clients: '👥', invoices: '📄', payments: '💰' };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-foreground">📋 Дневные задачи</h3>
        <span className="text-xs text-muted-foreground">{completedCount}/{tasks.length}</span>
      </div>
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className={`p-3 rounded-lg border ${task.completed ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">
                {icons[task.type]} {task.title}
              </span>
              <span className="text-xs font-semibold text-accent">+{task.xpReward} XP</span>
            </div>
            <Progress value={(task.current / task.target) * 100} className="h-2" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">{task.current}/{task.target}</span>
              {task.completed && <span className="text-xs text-primary font-medium">✅ Выполнено</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
