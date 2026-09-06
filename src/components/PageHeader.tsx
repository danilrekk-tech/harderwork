import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  emoji?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, icon: Icon, emoji, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {(Icon || emoji) && (
          <div className="w-11 h-11 rounded-2xl glass glass-shine flex items-center justify-center flex-shrink-0">
            {Icon ? <Icon className="w-5 h-5 text-primary" /> : <span className="text-xl">{emoji}</span>}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground truncate">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
