import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider } from "@/context/AppContext";
import AppLayout from "@/components/AppLayout";
import LeaderDashboardPage from "@/pages/LeaderDashboardPage";
import DashboardPage from "@/pages/DashboardPage";
import AuthPage from "@/pages/AuthPage";
import InviteSignupPage from "@/pages/InviteSignupPage";
import NotFound from "./pages/NotFound.tsx";
import { APP_ROUTES, type AppRoute } from "@/config/routes";

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

function wrapByAccess(route: AppRoute, element: React.ReactNode) {
  if (route.access === 'leader') return <LeaderRoute>{element}</LeaderRoute>;
  if (route.access === 'manager') return <ManagerRoute>{element}</ManagerRoute>;
  return element;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />
      <Route path="/invite" element={<InviteSignupPage />} />
      <Route element={<ProtectedRoute><AppProvider><AppLayout /></AppProvider></ProtectedRoute>}>
        <Route path="/" element={<RoleDashboard />} />
        {APP_ROUTES.filter((r) => r.path !== '/').map((route) => {
          const Page = route.Component;
          const element = (
            <Suspense fallback={<FullScreenLoader />}>
              <Page />
            </Suspense>
          );
          return (
            <Route
              key={route.path}
              path={route.path}
              element={wrapByAccess(route, element)}
            />
          );
        })}
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
