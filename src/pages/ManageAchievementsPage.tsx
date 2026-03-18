import AdminAchievementsTab from '@/components/admin/AdminAchievementsTab';

export default function ManageAchievementsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">⭐ Управление достижениями</h1>
      <AdminAchievementsTab />
    </div>
  );
}
