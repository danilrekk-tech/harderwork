import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider } from "@/context/AppContext";
import AppLayout from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import LeaderDashboardPage from "@/pages/LeaderDashboardPage";
import InvoicesPage from "@/pages/InvoicesPage";
import ClientsPage from "@/pages/ClientsPage";
import CalendarPage from "@/pages/CalendarPage";
import AchievementsPage from "@/pages/AchievementsPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import ShopPage from "@/pages/ShopPage";
import SettingsPage from "@/pages/SettingsPage";
import ManagersPage from "@/pages/ManagersPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ContestsPage from "@/pages/ContestsPage";
import ActivitiesPage from "@/pages/ActivitiesPage";
import ManageAchievementsPage from "@/pages/ManageAchievementsPage";
import ManageBoostsPage from "@/pages/ManageBoostsPage";
import AuthPage from "@/pages/AuthPage";
import InviteSignupPage from "@/pages/InviteSignupPage";
import KnowledgeBasePage from "@/pages/KnowledgeBasePage";
import NotFound from "./pages/NotFound.tsx";

// New manager pages
import MyAnalyticsPage from "@/pages/MyAnalyticsPage";
import SkillsPage from "@/pages/SkillsPage";
import FocusPage from "@/pages/FocusPage";
import DailyTasksPage from "@/pages/DailyTasksPage";
import ViewContestsPage from "@/pages/ViewContestsPage";
import ViewActivitiesPage from "@/pages/ViewActivitiesPage";
import RecordsPage from "@/pages/RecordsPage";
import MyPenaltiesPage from "@/pages/MyPenaltiesPage";
import InventoryPage from "@/pages/InventoryPage";
import RemindersPage from "@/pages/RemindersPage";
import ProfilePage from "@/pages/ProfilePage";
import EventLogPage from "@/pages/EventLogPage";

// New leader pages
import PenaltiesManagementPage from "@/pages/PenaltiesManagementPage";
import TeamPlanPage from "@/pages/TeamPlanPage";
import TeamLeaderboardPage from "@/pages/TeamLeaderboardPage";
import SeasonsPage from "@/pages/SeasonsPage";
import CollectionsPage from "@/pages/CollectionsPage";
import InvitesPage from "@/pages/InvitesPage";
import AllInvoicesPage from "@/pages/AllInvoicesPage";
import AllClientsPage from "@/pages/AllClientsPage";
import DisciplinePage from "@/pages/DisciplinePage";
import TeamActivityPage from "@/pages/TeamActivityPage";
import ReportsPage from "@/pages/ReportsPage";
import ShopAnalyticsPage from "@/pages/ShopAnalyticsPage";
import AdminPage from "@/pages/AdminPage";

// New Opus 4.7 features
import AIAssistantPage from "@/pages/AIAssistantPage";
import MysteryBoxPage from "@/pages/MysteryBoxPage";
import FortuneWheelPage from "@/pages/FortuneWheelPage";
import DealFunnelPage from "@/pages/DealFunnelPage";
import AIInsightsPage from "@/pages/AIInsightsPage";
import TeamKPIPage from "@/pages/TeamKPIPage";
import AutomationPage from "@/pages/AutomationPage";

const queryClient = new QueryClient();

function FullScreenLoader({ label = 'Загрузка...' }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, roleReady } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/auth" replace />;
  // Wait for role to be resolved before rendering protected app to prevent flash/redirect loops
  if (!roleReady) return <FullScreenLoader label="Проверяем доступ..." />;
  return <>{children}</>;
}

function LeaderRoute({ children }: { children: React.ReactNode }) {
  const { role, roleReady } = useAuth();
  if (!roleReady) return <FullScreenLoader label="Проверяем доступ..." />;
  if (role !== 'leader') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ManagerRoute({ children }: { children: React.ReactNode }) {
  const { role, roleReady } = useAuth();
  if (!roleReady) return <FullScreenLoader label="Проверяем доступ..." />;
  if (role === 'leader') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RoleDashboard() {
  const { role, roleReady } = useAuth();
  if (!roleReady) return <FullScreenLoader label="Проверяем доступ..." />;
  return role === 'leader' ? <LeaderDashboardPage /> : <DashboardPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />
      <Route path="/invite" element={<InviteSignupPage />} />
      <Route element={<ProtectedRoute><AppProvider><AppLayout /></AppProvider></ProtectedRoute>}>
        <Route path="/" element={<RoleDashboard />} />
        
        {/* Manager-only routes */}
        <Route path="/invoices" element={<ManagerRoute><InvoicesPage /></ManagerRoute>} />
        <Route path="/clients" element={<ManagerRoute><ClientsPage /></ManagerRoute>} />
        <Route path="/calendar" element={<ManagerRoute><CalendarPage /></ManagerRoute>} />
        <Route path="/my-analytics" element={<ManagerRoute><MyAnalyticsPage /></ManagerRoute>} />
        <Route path="/daily-tasks" element={<ManagerRoute><DailyTasksPage /></ManagerRoute>} />
        <Route path="/focus" element={<ManagerRoute><FocusPage /></ManagerRoute>} />
        <Route path="/skills" element={<ManagerRoute><SkillsPage /></ManagerRoute>} />
        <Route path="/achievements" element={<ManagerRoute><AchievementsPage /></ManagerRoute>} />
        <Route path="/records" element={<ManagerRoute><RecordsPage /></ManagerRoute>} />
        <Route path="/leaderboard" element={<ManagerRoute><LeaderboardPage /></ManagerRoute>} />
        <Route path="/view-contests" element={<ManagerRoute><ViewContestsPage /></ManagerRoute>} />
        <Route path="/view-activities" element={<ManagerRoute><ViewActivitiesPage /></ManagerRoute>} />
        <Route path="/shop" element={<ManagerRoute><ShopPage /></ManagerRoute>} />
        <Route path="/inventory" element={<ManagerRoute><InventoryPage /></ManagerRoute>} />
        <Route path="/reminders" element={<ManagerRoute><RemindersPage /></ManagerRoute>} />
        <Route path="/my-penalties" element={<ManagerRoute><MyPenaltiesPage /></ManagerRoute>} />
        <Route path="/event-log" element={<ManagerRoute><EventLogPage /></ManagerRoute>} />
        <Route path="/profile" element={<ManagerRoute><ProfilePage /></ManagerRoute>} />
        <Route path="/ai-assistant" element={<ManagerRoute><AIAssistantPage /></ManagerRoute>} />
        <Route path="/funnel" element={<ManagerRoute><DealFunnelPage /></ManagerRoute>} />
        <Route path="/mystery-box" element={<ManagerRoute><MysteryBoxPage /></ManagerRoute>} />
        <Route path="/fortune-wheel" element={<ManagerRoute><FortuneWheelPage /></ManagerRoute>} />

        {/* Leader-only routes */}
        <Route path="/admin" element={<LeaderRoute><AdminPage /></LeaderRoute>} />
        <Route path="/ai-insights" element={<LeaderRoute><AIInsightsPage /></LeaderRoute>} />
        <Route path="/team-kpi" element={<LeaderRoute><TeamKPIPage /></LeaderRoute>} />
        <Route path="/automation" element={<LeaderRoute><AutomationPage /></LeaderRoute>} />
        <Route path="/managers" element={<LeaderRoute><ManagersPage /></LeaderRoute>} />
        <Route path="/analytics" element={<LeaderRoute><AnalyticsPage /></LeaderRoute>} />
        <Route path="/all-invoices" element={<LeaderRoute><AllInvoicesPage /></LeaderRoute>} />
        <Route path="/all-clients" element={<LeaderRoute><AllClientsPage /></LeaderRoute>} />
        <Route path="/team-plan" element={<LeaderRoute><TeamPlanPage /></LeaderRoute>} />
        <Route path="/team-leaderboard" element={<LeaderRoute><TeamLeaderboardPage /></LeaderRoute>} />
        <Route path="/reports" element={<LeaderRoute><ReportsPage /></LeaderRoute>} />
        <Route path="/discipline" element={<LeaderRoute><DisciplinePage /></LeaderRoute>} />
        <Route path="/team-activity" element={<LeaderRoute><TeamActivityPage /></LeaderRoute>} />
        <Route path="/contests" element={<LeaderRoute><ContestsPage /></LeaderRoute>} />
        <Route path="/activities" element={<LeaderRoute><ActivitiesPage /></LeaderRoute>} />
        <Route path="/penalties-management" element={<LeaderRoute><PenaltiesManagementPage /></LeaderRoute>} />
        <Route path="/manage-achievements" element={<LeaderRoute><ManageAchievementsPage /></LeaderRoute>} />
        <Route path="/collections" element={<LeaderRoute><CollectionsPage /></LeaderRoute>} />
        <Route path="/seasons" element={<LeaderRoute><SeasonsPage /></LeaderRoute>} />
        <Route path="/manage-boosts" element={<LeaderRoute><ManageBoostsPage /></LeaderRoute>} />
        <Route path="/shop-analytics" element={<LeaderRoute><ShopAnalyticsPage /></LeaderRoute>} />
        <Route path="/invites" element={<LeaderRoute><InvitesPage /></LeaderRoute>} />

        {/* Shared routes */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/knowledge" element={<KnowledgeBasePage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
