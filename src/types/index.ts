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
  clientTime: string;
  myTime: string;
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
  collectionId?: string;
  unlockedAt?: string;
}

export interface AchievementCondition {
  type: 'invoices_issued' | 'invoices_paid' | 'clients_processed' | 'streak_days' | 'total_revenue' | 'xp_earned' | 'combo_max' | 'plan_completed' | 'plan_overfulfilled' | 'level_reached';
  target: number;
}

export interface AchievementCollection {
  id: string;
  name: string;
  icon: string;
  achievementIds: string[];
  bonusXp: number;
}

export interface BoostItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpCost: number;
  effect: string;
}

export interface SkillTree {
  closing: number;
  processing: number;
  planning: number;
  availablePoints: number;
}

export interface ActionEvent {
  id: string;
  type: 'client_added' | 'invoice_issued' | 'invoice_paid' | 'plan_completed' | 'achievement_unlocked' | 'level_up' | 'focus_completed' | 'record_broken' | 'combo';
  description: string;
  xpEarned: number;
  timestamp: string;
  managerName?: string;
}

export interface MomentumState {
  value: number;
  lastActionAt?: string;
  bonusActiveUntil?: string;
}

export interface ComboState {
  count: number;
  maxCombo: number;
  lastActionAt?: string;
}

export interface PersonalRecords {
  maxInvoicesPerDay: { value: number; date?: string };
  maxPaymentsPerDay: { value: number; date?: string };
  maxClientsPerDay: { value: number; date?: string };
  maxRevenuePerDay: { value: number; date?: string };
}

export interface DailyTask {
  id: string;
  type: 'clients' | 'invoices' | 'payments';
  title: string;
  target: number;
  current: number;
  xpReward: number;
  completed: boolean;
  date: string;
}

export interface MultiLevelPlan {
  invoices: { min: number; norm: number; challenge: number };
  payments: { min: number; norm: number; challenge: number };
}

export interface Season {
  id: string;
  number: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface FocusSession {
  isActive: boolean;
  startedAt?: string;
  durationMinutes: number;
  actionsCount: number;
  bonusXpPercent: number;
}

export interface ManagerProfile {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXpEarned: number;
  xpSpent: number;
  streakDays: number;
  lastActiveDate: string;
  processedClientsCount: number;
}

export interface PlanSettings {
  type: 'amount' | 'count';
  target: number;
  period: 'monthly';
}

export interface WorkSchedule {
  workDays: number[];
  startTime: string;
  endTime: string;
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
  | 'xp_progress'
  | 'daily_tasks'
  | 'sales_feed'
  | 'activity_heatmap'
  | 'focus_session'
  | 'near_achievements'
  | 'unpaid_invoices'
  | 'personal_records'
  | 'skills'
  | 'sales_momentum';

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  revenue: number;
  invoicesPaid: number;
  level: number;
  xp?: number;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: number;
  xp: number;
  revenue: number;
  invoicesPaid: number;
  invoicesIssued: number;
  clientsProcessed: number;
  streakDays: number;
  disciplineIndex: number;
  isBlocked: boolean;
  createdAt: string;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team';
  startDate: string;
  endDate: string;
  prize: string;
  prizeXp: number;
  metric: 'revenue' | 'invoices' | 'clients';
  target: number;
  teams?: ContestTeam[];
  isActive: boolean;
}

export interface ContestTeam {
  id: string;
  name: string;
  memberIds: string[];
  score: number;
}

export interface BonusActivity {
  id: string;
  title: string;
  description: string;
  period: 'daily' | 'weekly' | 'monthly';
  prize: string;
  xpReward: number;
  metric: 'revenue' | 'invoices' | 'clients';
  target: number;
  isActive: boolean;
  createdAt: string;
}

export interface AppState {
  profile: ManagerProfile;
  clients: Client[];
  invoices: Invoice[];
  reminders: Reminder[];
  achievements: Achievement[];
  unlockedAchievements: string[];
  collections: AchievementCollection[];
  completedCollections: string[];
  boostInventory: string[];
  skills: SkillTree;
  eventLog: ActionEvent[];
  momentum: MomentumState;
  combo: ComboState;
  personalRecords: PersonalRecords;
  dailyTasks: DailyTask[];
  focusSession: FocusSession;
  multiLevelPlan: MultiLevelPlan;
  season: Season;
  planSettings: PlanSettings;
  workSchedule: WorkSchedule;
  dashboardWidgets: WidgetConfig[];
  isAdmin: boolean;
  leaderboard: LeaderboardEntry[];
  managers: Manager[];
  contests: Contest[];
  bonusActivities: BonusActivity[];
  customAchievements: Achievement[];
  customBoosts: BoostItem[];
  planCompletedThisMonth: boolean;
}
