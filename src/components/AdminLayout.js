import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Headphones,
  LogOut,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Shield,
  ExternalLink,
  Upload,
  Home,
  Menu,
  Bell,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { podcastService } from '../services/apiService';

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 68;

const NAV_ITEMS = [
  {
    label: 'Upload Podcasts',
    path: '/admin/podcasts',
    badgeKey: 'podcasts',
    icon: Upload,
    description: 'Add & manage episodes',
  },
  {
    label: 'Notifications',
    path: '/admin/notifications',
    icon: Bell,
    description: 'Push alerts to members',
  },
];

function isNavActive(pathname, path) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

const AdminLayout = ({ title, subtitle, children, onRefresh, refreshing = false, mainClassName }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [podcastCount, setPodcastCount] = useState(null);

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;
  const displayName = currentUser?.name || currentUser?.email || 'Admin';
  const initials = (displayName[0] || 'A').toUpperCase();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;
    podcastService
      .getPodcasts()
      .then((data) => {
        if (!cancelled) setPodcastCount(Array.isArray(data) ? data.length : 0);
      })
      .catch(() => {
        if (!cancelled) setPodcastCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] overflow-hidden bg-gray-50 font-sans text-gray-900">
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-gray-200 bg-white transition-[width,transform] duration-200 ease-in-out lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ width: sidebarWidth }}
      >
        {/* Brand — matches public Layout header tone */}
        <div
          className={`flex h-[60px] flex-shrink-0 items-center border-b border-gray-200 ${
            collapsed ? 'justify-center px-2' : 'px-5'
          }`}
        >
          {!collapsed ? (
            <Link to="/admin/podcasts" className="flex min-w-0 items-center gap-3 hover:opacity-90">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-600">
                <Shield className="h-[17px] w-[17px] text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-slate-900">FOG Admin</p>
                <p className="truncate text-[11px] font-medium text-slate-400">Admin workspace</p>
              </div>
            </Link>
          ) : (
            <Link
              to="/admin/podcasts"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600"
            >
              <Shield className="h-[17px] w-[17px] text-white" />
            </Link>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          {!collapsed && (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </p>
          )}

          <ul className={collapsed ? 'space-y-1' : 'space-y-1'}>
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(location.pathname, item.path);
              const Icon = item.icon;
              const badge =
                item.badgeKey === 'podcasts' && podcastCount != null ? podcastCount : null;

              if (collapsed) {
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      title={item.label}
                      onClick={() => setMobileNavOpen(false)}
                      className={[
                        'relative flex items-center justify-center rounded-lg p-2.5 transition-colors',
                        active
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600',
                      ].join(' ')}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                      {badge != null && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-600 px-1 text-[9px] font-bold text-white">
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileNavOpen(false)}
                    className={[
                      'group block rounded-xl border transition-all duration-200',
                      active
                        ? 'border-primary-200 bg-primary-50 shadow-sm ring-1 ring-primary-100'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div
                        className={[
                          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
                          active
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600',
                        ].join(' ')}
                      >
                        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={[
                            'truncate text-sm font-semibold leading-tight',
                            active ? 'text-primary-900' : 'text-slate-900',
                          ].join(' ')}
                        >
                          {item.label}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {item.description}
                        </p>
                      </div>
                      {badge != null && (
                        <div className="flex-shrink-0 text-right">
                          <p
                            className={[
                              'text-base font-bold tabular-nums leading-none',
                              active ? 'text-primary-600' : 'text-slate-700',
                            ].join(' ')}
                          >
                            {badge}
                          </p>
                          <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-slate-400">
                            episodes
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {!collapsed && (
            <>
              <div className="mx-3 my-5 border-t border-gray-100" />
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Shortcuts
              </p>
              <div className="space-y-0.5">
                <Link
                  to="/podcasts"
                  className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <Headphones
                    className="h-[18px] w-[18px] flex-shrink-0 text-slate-400 group-hover:text-slate-500"
                    strokeWidth={1.75}
                  />
                  <span className="truncate">Public podcasts</span>
                  <ExternalLink className="ml-auto h-3 w-3 flex-shrink-0 text-slate-300" />
                </Link>
                <Link
                  to="/"
                  className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <Home
                    className="h-[18px] w-[18px] flex-shrink-0 text-slate-400 group-hover:text-slate-500"
                    strokeWidth={1.75}
                  />
                  <span className="truncate">Back to home</span>
                  <ExternalLink className="ml-auto h-3 w-3 flex-shrink-0 text-slate-300" />
                </Link>
              </div>
            </>
          )}
        </nav>

        <div className={`flex-shrink-0 border-t border-gray-200 ${collapsed ? 'p-2' : 'p-4'}`}>
          {collapsed ? (
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="flex w-full items-center justify-center rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-slate-50 px-3 py-2.5">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-600/10 text-sm font-semibold text-primary-600">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-600">
                    Administrator
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-[72px] z-40 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </aside>

      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-200 ease-in-out max-lg:!ml-0"
        style={{ marginLeft: sidebarWidth }}
      >
        <header className="sticky top-0 z-20 flex h-[60px] flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:px-7">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Link to="/admin/podcasts" className="font-medium hover:text-primary-600">
                Admin
              </Link>
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
              <span className="truncate font-semibold text-slate-900">{title}</span>
            </div>
            {subtitle && (
              <p className="mt-0.5 truncate text-sm text-slate-500">{subtitle}</p>
            )}
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-700 sm:inline-flex">
              <Shield className="h-3 w-3" />
              Admin
            </span>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
          </div>
        </header>

        <main
          className={
            mainClassName ??
            'min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] touch-pan-y p-4 sm:p-7'
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
