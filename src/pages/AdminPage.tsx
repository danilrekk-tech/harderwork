import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigate } from 'react-router-dom';
import AdminManagersTab from '@/components/admin/AdminManagersTab';
import AdminContestsTab from '@/components/admin/AdminContestsTab';
import AdminActivitiesTab from '@/components/admin/AdminActivitiesTab';
import AdminAchievementsTab from '@/components/admin/AdminAchievementsTab';
import AdminBoostsTab from '@/components/admin/AdminBoostsTab';
import AdminStatsTab from '@/components/admin/AdminStatsTab';
import AdminAnalyticsTab from '@/components/admin/AdminAnalyticsTab';

export default function AdminPage() {
  const { role } = useAuth();
  if (role !== 'leader') return <Navigate to="/" replace />;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">🛡️ Админ-панель</h1>
      <Tabs defaultValue="managers" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
          <TabsTrigger value="managers">Менеджеры</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          <TabsTrigger value="contests">Конкурсы</TabsTrigger>
          <TabsTrigger value="activities">Активности</TabsTrigger>
          <TabsTrigger value="achievements">Достижения</TabsTrigger>
          <TabsTrigger value="boosts">Бусты</TabsTrigger>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
        </TabsList>
        <TabsContent value="managers"><AdminManagersTab /></TabsContent>
        <TabsContent value="analytics"><AdminAnalyticsTab /></TabsContent>
        <TabsContent value="contests"><AdminContestsTab /></TabsContent>
        <TabsContent value="activities"><AdminActivitiesTab /></TabsContent>
        <TabsContent value="achievements"><AdminAchievementsTab /></TabsContent>
        <TabsContent value="boosts"><AdminBoostsTab /></TabsContent>
        <TabsContent value="stats"><AdminStatsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
