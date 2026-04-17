import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Building2 } from 'lucide-react';

export default function AdminSystemSettingsTab() {
  const [companyName, setCompanyName] = useState('MegaGroup Team');
  const [logoUrl, setLogoUrl] = useState('');
  const [maxManagers, setMaxManagers] = useState(100);
  const [maxInvites, setMaxInvites] = useState(20);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('app_settings').select('*');
      data?.forEach((s: any) => {
        if (s.key === 'company') {
          setCompanyName(s.value.name || 'MegaGroup Team');
          setLogoUrl(s.value.logo_url || '');
        }
        if (s.key === 'limits') {
          setMaxManagers(s.value.max_managers || 100);
          setMaxInvites(s.value.max_invites_per_day || 20);
        }
      });
    })();
  }, []);

  const save = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('app_settings').upsert([
      { key: 'company', value: { name: companyName, logo_url: logoUrl, primary_color: '#16a918' }, updated_by: user?.id, updated_at: new Date().toISOString() },
      { key: 'limits', value: { max_managers: maxManagers, max_invites_per_day: maxInvites }, updated_by: user?.id, updated_at: new Date().toISOString() },
    ], { onConflict: 'key' });
    if (user) {
      await supabase.from('audit_log').insert({
        actor_id: user.id, actor_name: user.email || '',
        action: 'update_settings', entity_type: 'app_settings',
        details: { companyName, maxManagers, maxInvites },
      });
    }
    toast.success('Настройки сохранены');
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Брендинг</h3>
        </div>
        <div>
          <Label>Название компании</Label>
          <Input value={companyName} onChange={e => setCompanyName(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label>URL логотипа</Label>
          <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className="mt-1.5" />
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-display text-lg font-semibold mb-2">Лимиты</h3>
        <div>
          <Label>Максимум менеджеров</Label>
          <Input type="number" value={maxManagers} onChange={e => setMaxManagers(+e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label>Максимум приглашений в день</Label>
          <Input type="number" value={maxInvites} onChange={e => setMaxInvites(+e.target.value)} className="mt-1.5" />
        </div>
      </div>

      <Button onClick={save} disabled={loading} className="quick-action-btn">
        <Save className="w-4 h-4" /> Сохранить
      </Button>
    </div>
  );
}
