import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';
import NotificationsBell from '@/components/NotificationsBell';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 relative overflow-x-hidden">
        {/* Desktop top-right floating bell */}
        <div className="hidden md:flex absolute top-4 right-6 z-30">
          <div className="glass rounded-full p-1">
            <NotificationsBell />
          </div>
        </div>
        <div className="p-4 md:p-6 lg:p-8 md:pt-8 pt-16">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
