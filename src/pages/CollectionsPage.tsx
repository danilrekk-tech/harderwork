import AdminAchievementsTab from '@/components/admin/AdminAchievementsTab';

export default function CollectionsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">📦 Коллекции достижений</h1>
      <AdminAchievementsTab />
    </div>
  );
}
