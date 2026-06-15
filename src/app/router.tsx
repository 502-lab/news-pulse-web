import { lazy, Suspense, type ComponentType } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/home'} replace />;
}
import AuthShell from '@/components/layout/AuthShell';
import UserGnbLayout from '@/components/layout/UserGnbLayout';
import AdminSidebarLayout from '@/components/layout/AdminSidebarLayout';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import GuestOnlyRoute from '@/components/guards/GuestOnlyRoute';
import GateRoute from '@/components/guards/GateRoute';
import AdminRoute from '@/components/guards/AdminRoute';
import FullPageSpinner from '@/components/common/FullPageSpinner';

function lazyPage(factory: () => Promise<{ default: ComponentType }>) {
  const Page = lazy(factory);
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Page />
    </Suspense>
  );
}

// Auth
const loginPage = lazyPage(() => import('@/pages/auth/LoginPage'));
const registerPage = lazyPage(() => import('@/pages/auth/RegisterPage'));
const forgotPasswordPage = lazyPage(() => import('@/pages/auth/ForgotPasswordPage'));
const verifyEmailPage = lazyPage(() => import('@/pages/auth/VerifyEmailPage'));
const reConsentPage = lazyPage(() => import('@/pages/auth/ReConsentPage'));
// Onboarding
const onboardingPage = lazyPage(() => import('@/pages/onboarding/OnboardingPage'));
// User
const homePage = lazyPage(() => import('@/pages/user/HomePage'));
const trendsPage = lazyPage(() => import('@/pages/user/TrendsPage'));
const biasPage = lazyPage(() => import('@/pages/user/BiasPage'));
const articleDetailPage = lazyPage(() => import('@/pages/user/ArticleDetailPage'));
const comparePage = lazyPage(() => import('@/pages/user/ComparePage'));
const insightsPage = lazyPage(() => import('@/pages/user/InsightsPage'));
const weeklyPage = lazyPage(() => import('@/pages/user/WeeklyPage'));
const settingsPage = lazyPage(() => import('@/pages/user/SettingsPage'));
// Admin
const adminHomePage = lazyPage(() => import('@/pages/admin/AdminHomePage'));
const ingestionPage = lazyPage(() => import('@/pages/admin/IngestionPage'));
const contentPage = lazyPage(() => import('@/pages/admin/ContentPage'));
const usersAdminPage = lazyPage(() => import('@/pages/admin/UsersAdminPage'));
const noticePage = lazyPage(() => import('@/pages/admin/NoticePage'));
// Social OAuth
const socialCallbackPage = lazyPage(() => import('@/pages/auth/SocialCallbackPage'));
const socialConsentPage = lazyPage(() => import('@/pages/auth/SocialConsentPage'));
// Error + Legal
const notFoundPage = lazyPage(() => import('@/pages/error/NotFoundPage'));
const termsPage = lazyPage(() => import('@/pages/legal/TermsPage'));
const privacyPage = lazyPage(() => import('@/pages/legal/PrivacyPage'));

export const router = createBrowserRouter([
  // ── 공개 (GuestOnlyRoute + AuthShell): 인증 사용자는 역할별 홈으로 ──
  {
    element: <GuestOnlyRoute />,
    children: [
      {
        element: <AuthShell />,
        children: [
          { path: '/login', element: loginPage },
          { path: '/register', element: registerPage },
          { path: '/forgot-password', element: forgotPasswordPage },
        ],
      },
    ],
  },

  // ── 법률 문서 (독립 레이아웃, 인증 무관) ──
  { path: '/terms', element: termsPage },
  { path: '/privacy', element: privacyPage },

  // ── 공개 (AuthShell만, 인증 무관) ──
  {
    element: <AuthShell />,
    children: [
      { path: '/oauth/callback', element: socialCallbackPage },
      { path: '/social-consent', element: socialConsentPage },
      // signup → pendingToken만 있는 상태에서 접근하므로 ProtectedRoute 밖에 위치
      { path: '/verify-email', element: verifyEmailPage },
    ],
  },

  // ── 보호 (ProtectedRoute) ──
  {
    element: <ProtectedRoute />,
    children: [
      // GateRoute 밖: 게이트 목적지 (AuthShell 레이아웃 유지)
      {
        element: <AuthShell />,
        children: [
          { path: '/re-consent', element: reConsentPage },
        ],
      },
      { path: '/onboarding', element: onboardingPage },

      // GateRoute 안: 역할별 레이아웃
      {
        element: <GateRoute />,
        children: [
          // USER — 상단 GNB 레이아웃
          {
            element: <UserGnbLayout />,
            children: [
              { path: '/home', element: homePage },
              { path: '/trends', element: trendsPage },
              { path: '/bias', element: biasPage },
              { path: '/articles/:id', element: articleDetailPage },
              { path: '/compare', element: comparePage },
              { path: '/insights', element: insightsPage },
              { path: '/weekly', element: weeklyPage },
              { path: '/settings', element: settingsPage },
            ],
          },
          // ADMIN — 좌측 사이드바 레이아웃 (USER 접근 차단)
          {
            element: <AdminRoute />,
            children: [
              {
                element: <AdminSidebarLayout />,
                children: [
                  { path: '/admin', element: adminHomePage },
                  { path: '/admin/ingestion', element: ingestionPage },
                  { path: '/admin/content', element: contentPage },
                  { path: '/admin/users', element: usersAdminPage },
                  { path: '/admin/notice', element: noticePage },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // ── 루트 리다이렉트 ──
  { path: '/', element: <RootRedirect /> },

  // ── 404 ──
  { path: '*', element: notFoundPage },
]);
