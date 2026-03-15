import { useApp } from '@/context/AppContext';

export default function ClientsWidget() {
  const { state } = useApp();
  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-3">👥 Клиенты</h3>
      <div className="stat-value text-primary">{state.clients.length}</div>
      <div className="stat-label">Обработано клиентов</div>
    </div>
  );
}
