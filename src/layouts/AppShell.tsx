import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/nav';
import FullPageSpinner from '@/components/common/FullPageSpinner';

export default function AppShell() {
  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={<FullPageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
