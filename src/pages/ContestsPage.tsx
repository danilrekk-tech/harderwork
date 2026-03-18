import AdminContestsTab from '@/components/admin/AdminContestsTab';

export default function ContestsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">🏆 Конкурсы</h1>
      <AdminContestsTab />
    </div>
  );
}
