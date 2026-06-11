import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from '@/components/nav';
import AppShell from '@/layouts/AppShell';
import DashboardPage from '@/pages/DashboardPage';
import TrendsPage from '@/pages/TrendsPage';
import BiasPage from '@/pages/BiasPage';
import ArticleDetailPage from '@/pages/ArticleDetailPage';
import MonitorPage from '@/pages/admin/MonitorPage';
import UsersPage from '@/pages/admin/UsersPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPage from '@/pages/auth/ForgotPage';
import TermsPage from '@/pages/legal/TermsPage';
import PrivacyPage from '@/pages/legal/PrivacyPage';
import NotFoundPage from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  // 공개 라우트 (Sidebar 없음)
  { path: '/login',    element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot',   element: <ForgotPage /> },
  { path: '/terms',    element: <TermsPage /> },
  { path: '/privacy',  element: <PrivacyPage /> },

  // 인증 필요 (USER + ADMIN 공통)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true,          element: <DashboardPage /> },
          { path: 'trends',       element: <TrendsPage /> },
          { path: 'bias',         element: <BiasPage /> },
          { path: 'articles/:id', element: <ArticleDetailPage /> },
          {
            element: <AdminRoute />,
            children: [
              { path: 'admin/monitor', element: <MonitorPage /> },
              { path: 'admin/users',   element: <UsersPage /> },
            ],
          },
        ],
      },
    ],
  },

  // 404
  { path: '*', element: <NotFoundPage /> },
]);
