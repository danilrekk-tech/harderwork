export type DealStatus = 'processed' | 'invoice_sent' | 'invoice_paid';

export interface Client {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  product: string;
  dealStatus: DealStatus;
  invoiceAmount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  status: 'issued' | 'paid';
  issuedAt: string;
  paidAt?: string;
}

export interface Reminder {
  id: string;
  clientId: string;
  clientTimezone: string;
  clientTime: string; // ISO datetime in client's timezone
  myTime: string; // ISO datetime in my timezone
  reason: string;
  amount?: number;
  completed: boolean;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: AchievementCondition;
  unlockedAt?: string;
}

export interface AchievementCondition {
  type: 'invoices_issued' | 'invoices_paid' | 'clients_processed' | 'streak_days' | 'total_revenue' | 'xp_earned';
  target: number;
}

export interface BoostItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpCost: number;
  effect: string;
}

export interface ManagerProfile {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXpEarned: number;
  streakDays: number;
  lastActiveDate: string;
}

export interface PlanSettings {
  type: 'amount' | 'count';
  target: number;
  period: 'monthly';
}

export interface WorkSchedule {
  workDays: number[]; // 0=Sun, 1=Mon, ...
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  timezone: string;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  position: number;
  size: 'small' | 'medium' | 'large';
  visible: boolean;
}

export type WidgetType =
  | 'plan_progress'
  | 'invoices'
  | 'clients'
  | 'work_days_left'
  | 'shift_timer'
  | 'leaderboard'
  | 'motivation'
  | 'xp_progress';

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  revenue: number;
  invoicesPaid: number;
  level: number;
}

export interface AppState {
  profile: ManagerProfile;
  clients: Client[];
  invoices: Invoice[];
  reminders: Reminder[];
  achievements: Achievement[];
  unlockedAchievements: string[];
  boostInventory: string[];
  planSettings: PlanSettings;
  workSchedule: WorkSchedule;
  dashboardWidgets: WidgetConfig[];
  isAdmin: boolean;
  leaderboard: LeaderboardEntry[];
}
