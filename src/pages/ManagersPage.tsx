import AdminManagersTab from '@/components/admin/AdminManagersTab';

export default function ManagersPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">👥 Менеджеры</h1>
      <AdminManagersTab />
    </div>
  );
}
