import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import QuickActions from '@/components/QuickActions';
import PlanProgressWidget from '@/components/widgets/PlanProgressWidget';
import InvoicesWidget from '@/components/widgets/InvoicesWidget';
import ClientsWidget from '@/components/widgets/ClientsWidget';
import WorkDaysWidget from '@/components/widgets/WorkDaysWidget';
import ShiftTimerWidget from '@/components/widgets/ShiftTimerWidget';
import LeaderboardWidget from '@/components/widgets/LeaderboardWidget';
import MotivationWidget from '@/components/widgets/MotivationWidget';
import XpProgressWidget from '@/components/widgets/XpProgressWidget';
import DailyTasksWidget from '@/components/widgets/DailyTasksWidget';
import SalesFeedWidget from '@/components/widgets/SalesFeedWidget';
import ActivityHeatmapWidget from '@/components/widgets/ActivityHeatmapWidget';
import FocusSessionWidget from '@/components/widgets/FocusSessionWidget';
import NearAchievementsWidget from '@/components/widgets/NearAchievementsWidget';
import UnpaidInvoicesWidget from '@/components/widgets/UnpaidInvoicesWidget';
import PersonalRecordsWidget from '@/components/widgets/PersonalRecordsWidget';
import SkillsWidget from '@/components/widgets/SkillsWidget';
import SalesMomentumWidget from '@/components/widgets/SalesMomentumWidget';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { WidgetType, WidgetConfig } from '@/types';

const WIDGET_COMPONENTS: Record<WidgetType, React.FC> = {
  plan_progress: PlanProgressWidget,
  invoices: InvoicesWidget,
  clients: ClientsWidget,
  work_days_left: WorkDaysWidget,
  shift_timer: ShiftTimerWidget,
  leaderboard: LeaderboardWidget,
  motivation: MotivationWidget,
  xp_progress: XpProgressWidget,
  daily_tasks: DailyTasksWidget,
  sales_feed: SalesFeedWidget,
  activity_heatmap: ActivityHeatmapWidget,
  focus_session: FocusSessionWidget,
  near_achievements: NearAchievementsWidget,
  unpaid_invoices: UnpaidInvoicesWidget,
  personal_records: PersonalRecordsWidget,
  skills: SkillsWidget,
  sales_momentum: SalesMomentumWidget,
};

const WIDGET_NAMES: Record<WidgetType, string> = {
  plan_progress: 'Прогресс плана',
  invoices: 'Счета',
  clients: 'Клиенты',
  work_days_left: 'Рабочие дни',
  shift_timer: 'Таймер смены',
  leaderboard: 'Лидерборд',
  motivation: 'Мотивация',
  xp_progress: 'XP прогресс',
  daily_tasks: 'Дневные задачи',
  sales_feed: 'Sales Feed',
  activity_heatmap: 'Карта активности',
  focus_session: 'Фокус-сессия',
  near_achievements: 'Почти достигнуто',
  unpaid_invoices: 'Неоплаченные',
  personal_records: 'Личные рекорды',
  skills: 'Навыки',
  sales_momentum: 'Sales Momentum',
};

function SortableWidget({ widget, onRemove, editMode }: { widget: WidgetConfig; onRemove: (id: string) => void; editMode: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: widget.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const Component = WIDGET_COMPONENTS[widget.type];

  const sizeClass = widget.size === 'large' ? 'md:col-span-2' : '';

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`${sizeClass} relative`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="widget-card h-full">
        {editMode && (
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            <button {...attributes} {...listeners} className="drag-handle p-1 rounded hover:bg-muted">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => onRemove(widget.id)} className="p-1 rounded hover:bg-destructive/10">
              <X className="w-4 h-4 text-destructive" />
            </button>
          </div>
        )}
        <Component />
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { state, updateWidgets } = useApp();
  const [editMode, setEditMode] = useState(false);

  const visibleWidgets = state.dashboardWidgets
    .filter(w => w.visible)
    .sort((a, b) => a.position - b.position);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = visibleWidgets.findIndex(w => w.id === active.id);
    const newIdx = visibleWidgets.findIndex(w => w.id === over.id);
    const reordered = arrayMove(visibleWidgets, oldIdx, newIdx).map((w, i) => ({ ...w, position: i }));
    const hidden = state.dashboardWidgets.filter(w => !w.visible);
    updateWidgets([...reordered, ...hidden]);
  }

  function removeWidget(id: string) {
    updateWidgets(state.dashboardWidgets.map(w => w.id === id ? { ...w, visible: false } : w));
  }

  function addWidget(type: WidgetType) {
    const existing = state.dashboardWidgets.find(w => w.type === type);
    if (existing) {
      updateWidgets(state.dashboardWidgets.map(w => w.id === existing.id ? { ...w, visible: true } : w));
    } else {
      const newWidget: WidgetConfig = { id: `w_${Date.now()}`, type, position: visibleWidgets.length, size: 'medium', visible: true };
      updateWidgets([...state.dashboardWidgets, newWidget]);
    }
  }

  const hiddenTypes = (Object.keys(WIDGET_COMPONENTS) as WidgetType[]).filter(
    t => !visibleWidgets.some(w => w.type === t)
  );

  const xpBalance = state.profile.totalXpEarned - state.profile.xpSpent;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="level-badge">Ур. {state.profile.level}</span>
            <span className="text-sm text-muted-foreground">{state.profile.name}</span>
            <span className="text-sm text-accent font-semibold">{xpBalance} XP</span>
            {state.profile.streakDays > 0 && <span className="text-sm">🔥 {state.profile.streakDays} дн.</span>}
          </div>
        </div>
        <Button variant={editMode ? "default" : "outline"} size="sm" onClick={() => setEditMode(!editMode)}>
          {editMode ? 'Готово' : 'Настроить'}
        </Button>
      </div>

      <QuickActions />

      {editMode && hiddenTypes.length > 0 && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 flex flex-wrap gap-2">
          {hiddenTypes.map(type => (
            <Button key={type} variant="outline" size="sm" onClick={() => addWidget(type)}>
              <Plus className="w-3 h-3 mr-1" /> {WIDGET_NAMES[type]}
            </Button>
          ))}
        </motion.div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visibleWidgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleWidgets.map(widget => (
              <SortableWidget key={widget.id} widget={widget} onRemove={removeWidget} editMode={editMode} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
