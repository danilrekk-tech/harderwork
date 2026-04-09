import AdminBoostsTab from '@/components/admin/AdminBoostsTab';
import { Sparkles } from 'lucide-react';

export default function ManageBoostsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
        <Sparkles className="w-7 h-7 text-primary" />
        Настройки магазина
      </h1>
      <AdminBoostsTab />
    </div>
  );
}
