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

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-muted-foreground">Загрузка...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function LeaderRoute({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  if (role !== 'leader') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ManagerRoute({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  if (role === 'leader') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RoleDashboard() {
  const { role } = useAuth();
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
        <Route path="/achievements" element={<ManagerRoute><AchievementsPage /></ManagerRoute>} />
        <Route path="/leaderboard" element={<ManagerRoute><LeaderboardPage /></ManagerRoute>} />
        <Route path="/shop" element={<ManagerRoute><ShopPage /></ManagerRoute>} />
        {/* Leader-only routes */}
        <Route path="/managers" element={<LeaderRoute><ManagersPage /></LeaderRoute>} />
        <Route path="/analytics" element={<LeaderRoute><AnalyticsPage /></LeaderRoute>} />
        <Route path="/contests" element={<LeaderRoute><ContestsPage /></LeaderRoute>} />
        <Route path="/activities" element={<LeaderRoute><ActivitiesPage /></LeaderRoute>} />
        <Route path="/manage-achievements" element={<LeaderRoute><ManageAchievementsPage /></LeaderRoute>} />
        <Route path="/manage-boosts" element={<LeaderRoute><ManageBoostsPage /></LeaderRoute>} />
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
