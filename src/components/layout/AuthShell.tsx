import { Outlet } from 'react-router-dom';

export default function AuthShell() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <span className="text-2xl font-bold text-brand tracking-tight">Newsift</span>
      </div>
      <div
        className="w-full bg-white rounded-card shadow-card"
        style={{ maxWidth: '400px' }}
      >
        <Outlet />
      </div>
    </div>
  );
}
