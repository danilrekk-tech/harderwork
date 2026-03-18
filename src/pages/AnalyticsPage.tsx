import AdminAnalyticsTab from '@/components/admin/AdminAnalyticsTab';

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">📊 Аналитика</h1>
      <AdminAnalyticsTab />
    </div>
  );
}
