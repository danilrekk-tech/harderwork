import AdminActivitiesTab from '@/components/admin/AdminActivitiesTab';

export default function ActivitiesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">🎯 Бонусные активности</h1>
      <AdminActivitiesTab />
    </div>
  );
}
