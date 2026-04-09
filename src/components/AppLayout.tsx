import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden md:pt-8 pt-16">
        <Outlet />
      </main>
    </div>
  );
}
