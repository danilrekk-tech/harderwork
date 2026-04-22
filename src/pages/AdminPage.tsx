import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigate } from 'react-router-dom';
import AdminManagersTab from '@/components/admin/AdminManagersTab';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminInvitesTab from '@/components/admin/AdminInvitesTab';
import AdminSystemSettingsTab from '@/components/admin/AdminSystemSettingsTab';
import AdminAuditLogTab from '@/components/admin/AdminAuditLogTab';
import AdminDevTab from '@/components/admin/AdminDevTab';
import { Shield, Users, Send, Settings, ScrollText, UserCog, FlaskConical } from 'lucide-react';

export default function AdminPage() {
  const { role, roleReady } = useAuth();
  if (!roleReady) return null;
  if (role !== 'leader') return <Navigate to="/" replace />;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="page-title">Админ-панель</h1>
          <p className="page-subtitle">Управление сервисом и пользователями</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="glass rounded-xl p-1 h-auto flex-wrap gap-1 mb-6">
          <TabsTrigger value="users" className="gap-2 rounded-lg"><UserCog className="w-4 h-4" />Пользователи</TabsTrigger>
          <TabsTrigger value="managers" className="gap-2 rounded-lg"><Users className="w-4 h-4" />Менеджеры (статистика)</TabsTrigger>
          <TabsTrigger value="invites" className="gap-2 rounded-lg"><Send className="w-4 h-4" />Приглашения</TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 rounded-lg"><Settings className="w-4 h-4" />Системные настройки</TabsTrigger>
          <TabsTrigger value="audit" className="gap-2 rounded-lg"><ScrollText className="w-4 h-4" />Логи аудита</TabsTrigger>
          <TabsTrigger value="dev" className="gap-2 rounded-lg"><FlaskConical className="w-4 h-4" />Разработчик</TabsTrigger>
        </TabsList>
        <TabsContent value="users"><AdminUsersTab /></TabsContent>
        <TabsContent value="managers"><AdminManagersTab /></TabsContent>
        <TabsContent value="invites"><AdminInvitesTab /></TabsContent>
        <TabsContent value="settings"><AdminSystemSettingsTab /></TabsContent>
        <TabsContent value="audit"><AdminAuditLogTab /></TabsContent>
        <TabsContent value="dev"><AdminDevTab /></TabsContent>
      </Tabs>
    </div>
  );
}
