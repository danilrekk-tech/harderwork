import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { getSidebarItemsForRole } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard } from 'lucide-react';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { role } = useAuth();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const groups = useMemo(() => {
    const items = [
      { path: '/', label: 'Главная', icon: LayoutDashboard, section: 'Главное' },
      ...getSidebarItemsForRole(role).map((r) => ({ path: r.path, label: r.label!, icon: r.icon!, section: r.section || 'Прочее' })),
    ];
    const map = new Map<string, typeof items>();
    items.forEach((i) => {
      const arr = map.get(i.section) || [];
      arr.push(i);
      map.set(i.section, arr);
    });
    return Array.from(map.entries());
  }, [role]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Поиск раздела…  (Ctrl+K)" />
      <CommandList>
        <CommandEmpty>Ничего не найдено</CommandEmpty>
        {groups.map(([section, items]) => (
          <CommandGroup key={section} heading={section}>
            {items.map((i) => (
              <CommandItem
                key={i.path}
                value={`${i.label} ${section}`}
                onSelect={() => {
                  navigate(i.path);
                  setOpen(false);
                }}
              >
                <i.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                {i.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
