import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, FileText } from 'lucide-react';
import { toast } from 'sonner';

function toCSV(rows: any[]): string {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [keys.join(','), ...rows.map(r => keys.map(k => esc(r[k])).join(','))].join('\n');
}
function download(name: string, content: string, type = 'text/csv') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsExportPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const exportTable = async (table: string, label: string) => {
    setLoading(table);
    try {
      const { data, error } = await supabase.from(table as any).select('*').limit(5000);
      if (error) throw error;
      download(`${table}_${new Date().toISOString().slice(0, 10)}.csv`, toCSV(data ?? []));
      toast.success(`${label}: ${data?.length ?? 0} строк`);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(null); }
  };

  const exportHTML = async () => {
    setLoading('report');
    try {
      const { data: profs } = await supabase.from('profiles').select('*');
      const { data: invs } = await supabase.from('invoices').select('amount, status');
      const total = (invs ?? []).reduce((s, i) => s + Number(i.amount), 0);
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Отчёт</title>
        <style>body{font-family:system-ui;padding:40px;max-width:800px;margin:0 auto}h1{color:#16a918}table{width:100%;border-collapse:collapse;margin:20px 0}td,th{border:1px solid #ddd;padding:8px}th{background:#f5f5f5}</style>
        </head><body>
        <h1>Отчёт по команде</h1>
        <p>Дата: ${new Date().toLocaleDateString()}</p>
        <h2>Сводка</h2>
        <p><b>Менеджеров:</b> ${profs?.length ?? 0}</p>
        <p><b>Счетов:</b> ${invs?.length ?? 0}</p>
        <p><b>Общая сумма:</b> ${total.toLocaleString()} ₽</p>
        <h2>Менеджеры</h2>
        <table><thead><tr><th>Имя</th><th>Уровень</th><th>XP</th></tr></thead>
        <tbody>${(profs ?? []).map((p: any) => `<tr><td>${p.name}</td><td>${p.level}</td><td>${p.xp}</td></tr>`).join('')}</tbody></table>
        </body></html>`;
      download(`report_${new Date().toISOString().slice(0, 10)}.html`, html, 'text/html');
      toast.success('HTML-отчёт скачан (можно распечатать в PDF)');
    } catch (e: any) { toast.error(e.message); } finally { setLoading(null); }
  };

  const items = [
    { table: 'profiles', label: 'Профили' },
    { table: 'clients', label: 'Клиенты' },
    { table: 'invoices', label: 'Счета' },
    { table: 'action_events', label: 'Активности' },
    { table: 'kudos', label: 'Kudos' },
    { table: 'audit_log', label: 'Аудит-лог' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><FileDown className="w-5 h-5 text-primary" /></div>
        <div><h1 className="page-title">Экспорт отчётов</h1><p className="page-subtitle">CSV-выгрузки и HTML-отчёт</p></div>
      </div>

      <Card className="p-5 glass">
        <h2 className="font-semibold mb-3">CSV-экспорт</h2>
        <div className="grid grid-cols-2 gap-2">
          {items.map(i => (
            <Button key={i.table} variant="outline" disabled={loading === i.table} onClick={() => exportTable(i.table, i.label)}>
              <FileDown className="w-4 h-4 mr-2" />{i.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-5 glass">
        <h2 className="font-semibold mb-3">HTML-отчёт (для печати в PDF)</h2>
        <Button onClick={exportHTML} disabled={loading === 'report'}><FileText className="w-4 h-4 mr-2" />Скачать отчёт</Button>
      </Card>
    </div>
  );
}
