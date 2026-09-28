import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { LibraryProvider } from './contexts/LibraryContext';
import { PodcastBookmarksProvider } from './contexts/PodcastBookmarksContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import AdminRoute from './components/AdminRoute';
import RequireVerifiedEmail from './components/RequireVerifiedEmail';
import './App.css';
import { hasCompletedOnboarding } from './utils/onboarding';

const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Members = lazy(() => import('./pages/Members'));
const Library = lazy(() => import('./pages/Library'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const Podcasts = lazy(() => import('./pages/Podcasts'));
const GeniusAcademy = lazy(() => import('./pages/GeniusAcademy'));
const Events = lazy(() => import('./pages/Events'));
const Counseling = lazy(() => import('./pages/Counseling'));
const Devotionals = lazy(() => import('./pages/Devotionals'));
const PrayerRequests = lazy(() => import('./pages/PrayerRequests'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const AdminPodcasts = lazy(() => import('./pages/admin/AdminPodcasts'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const VerifyEmail = lazy(() => import('./components/VerifyEmail'));

const PageFallback = () => (
  <div className="min-h-[100dvh] bg-white" aria-busy="true" aria-label="Loading" />
);

const MOBILE_SPLASH_MEDIA = '(max-width: 1023px)';
const BUILD_SHA = process.env.REACT_APP_BUILD_SHA || 'unknown';

function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_SPLASH_MEDIA).matches;
}

function App() {
  const [showSplash, setShowSplash] = useState(() => isMobileViewport());
  const [appReady, setAppReady] = useState(() => !isMobileViewport());
  const [onboarded, setOnboarded] = useState(() => hasCompletedOnboarding());
  const onboardingCompleteHandler = useMemo(
    () => () => setOnboarded(true),
    []
  );

  const handleSplashComplete = useMemo(
    () => () => {
      setShowSplash(false);
    },
    []
  );

  const handleSplashExitStart = useMemo(() => () => setAppReady(true), []);

  useEffect(() => {
    console.info('[FOG] build', BUILD_SHA);
  }, []);

  return (
    <>
      {showSplash && (
        <SplashScreen
          onComplete={handleSplashComplete}
          onExitStart={handleSplashExitStart}
        />
      )}
      <div
        className="min-h-[100dvh]"
        style={{
          opacity: appReady ? 1 : 0,
          transition: 'opacity 0.85s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
      <AuthProvider>
        <LibraryProvider>
          <PodcastBookmarksProvider>
          <Router>
            <NotificationsProvider>
            <div className="App">
              <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/profile" element={<Navigate to="/" replace />} />

                <Route
                  path="/onboarding"
                  element={
                    <RequireVerifiedEmail>
                      <Layout>
                        <Onboarding onComplete={onboardingCompleteHandler} />
                      </Layout>
                    </RequireVerifiedEmail>
                  }
                />

                <Route
                  path="/"
                  element={
                    onboarded || hasCompletedOnboarding() ? (
                      <RequireVerifiedEmail>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </RequireVerifiedEmail>
                    ) : (
                      <Navigate to="/onboarding" replace />
                    )
                  }
                />

                {/* Public routes (signed-in users must verify email first) */}
                <Route path="/members" element={<RequireVerifiedEmail><Layout><Members /></Layout></RequireVerifiedEmail>} />
                <Route path="/library" element={<RequireVerifiedEmail><Layout><Library /></Layout></RequireVerifiedEmail>} />
                <Route path="/bookmarks" element={<RequireVerifiedEmail><Layout><Bookmarks /></Layout></RequireVerifiedEmail>} />
                <Route path="/podcasts" element={<RequireVerifiedEmail><Layout><Podcasts /></Layout></RequireVerifiedEmail>} />
                <Route path="/podcasts/:categoryId" element={<RequireVerifiedEmail><Layout><Podcasts /></Layout></RequireVerifiedEmail>} />
                <Route path="/masterclass" element={<RequireVerifiedEmail><Layout><GeniusAcademy /></Layout></RequireVerifiedEmail>} />
                <Route path="/events" element={<RequireVerifiedEmail><Layout><Events /></Layout></RequireVerifiedEmail>} />
                <Route path="/counseling" element={<RequireVerifiedEmail><Layout><Counseling /></Layout></RequireVerifiedEmail>} />
                <Route path="/devotionals" element={<RequireVerifiedEmail><Layout><Devotionals /></Layout></RequireVerifiedEmail>} />
                <Route path="/prayer-requests" element={<RequireVerifiedEmail><Layout><PrayerRequests /></Layout></RequireVerifiedEmail>} />

                {/* Admin */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <Navigate to="/admin/podcasts" replace />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/podcasts"
                  element={
                    <AdminRoute>
                      <AdminPodcasts />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/notifications"
                  element={
                    <AdminRoute>
                      <AdminNotifications />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <Navigate to="/admin/podcasts" replace />
                    </AdminRoute>
                  }
                />
              </Routes>
              </Suspense>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: { background: '#363636', color: '#fff' },
                  success: {
                    duration: 3000,
                    iconTheme: { primary: '#10b981', secondary: '#fff' },
                  },
                }}
              />
            </div>
            </NotificationsProvider>
          </Router>
          </PodcastBookmarksProvider>
        </LibraryProvider>
      </AuthProvider>
      </div>
    </>
  );
}

export default App;
