import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Calendar,
  Menu,
  Search,
  Bookmark,
  MessageCircle,
  Library,
  Headphones,
  GraduationCap,
  HeartHandshake,
  LogOut,
  LayoutDashboard,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { AudioPlayerProvider, useAudioPlayer } from '../contexts/AudioPlayerContext';
import FogWordmark from './FogWordmark';
import NotificationBell from './notifications/NotificationBell';
import { routeHasOwnMobileHeader } from '../constants/mobilePageRoutes';
import LegalFooterLinks from './legal/LegalFooterLinks';

const LayoutShell = ({ children }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { open: notificationsOpen, close: closeNotifications } = useNotifications();
  const { isActive: audioPlayerActive } = useAudioPlayer();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const flyingHeartRef = useRef(null);
  const mainRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname !== '/') return;
    const main = mainRef.current;
    if (!main) return;
    main.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  const navSections = [
    {
      title: 'Platform',
      items: [{ name: 'Dashboard', href: '/', icon: Home }],
    },
    {
      title: 'Content',
      items: [
        { name: 'Library', href: '/library', icon: Library },
        { name: 'Podcasts', href: '/podcasts', icon: Headphones },
        { name: 'Events', href: '/events', icon: Calendar },
        { name: 'Genius Academy', href: '/masterclass', icon: GraduationCap },
        { name: 'Devotionals', href: '/devotionals', icon: BookOpen },
      ],
    },
    {
      title: 'Community',
      items: [
        { name: 'Counseling', href: '/counseling', icon: HeartHandshake },
        { name: 'Prayer Requests', href: '/prayer-requests', icon: MessageCircle },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  // Add flying heart animation handler
  const handleHeartClick = (e) => {
    // Only animate if the clicked icon is the Heart
    if (flyingHeartRef.current) {
      flyingHeartRef.current.classList.remove('animate-fly-heart');
    
      // Force reflow to restart animation
      void flyingHeartRef.current.offsetWidth;
      flyingHeartRef.current.classList.add('animate-fly-heart');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileOpen && !event.target.closest('.profile-dropdown') && !event.target.closest('.profile-mobile-overlay')) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  const mobileOverlayOpen = sidebarOpen || notificationsOpen || profileOpen;
  const hideGlobalMobileHeader =
    sidebarOpen || routeHasOwnMobileHeader(location.pathname);

  useEffect(() => {
    if (!mobileOverlayOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOverlayOpen]);

  const displayName =
    currentUser?.name ||
    (currentUser?.email ? currentUser.email.split('@')[0] : 'Member');
  const userInitials = (() => {
    if (!currentUser) return '';
    if (currentUser.name && String(currentUser.name).trim()) {
      const parts = String(currentUser.name).trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return String(currentUser.name).slice(0, 2).toUpperCase();
    }
    return (currentUser.email || '?').slice(0, 2).toUpperCase();
  })();

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] overflow-hidden bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: on lg, stays fixed in the row while only the main column scrolls */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-gray-200 bg-white lg:static lg:h-full lg:translate-x-0 lg:overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transform transition-transform duration-300 ease-in-out`}
      >
        <div className="flex h-14 shrink-0 items-center border-b border-gray-100 px-4 lg:h-16">
          <Link
            to="/"
            className="flex min-w-0 flex-1 flex-col gap-0.5 hover:opacity-90"
            onClick={() => setSidebarOpen(false)}
          >
            <FogWordmark size="md" />
            <span className="text-[11px] font-medium text-slate-400">Family of Greatness</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6 last:mb-2">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isHeart = item.name === 'Prayer Requests';
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      onClick={(e) => {
                        setSidebarOpen(false);
                        if (isHeart) handleHeartClick(e);
                      }}
                    >
                      <Icon
                        ref={isHeart ? flyingHeartRef : null}
                        size={18}
                        strokeWidth={1.75}
                        className={
                          active ? 'text-[#2563eb]' : 'text-slate-400 group-hover:text-slate-500'
                        }
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-gray-100 px-4 py-3">
          <LegalFooterLinks variant="sidebar" />
        </div>
      </div>

      {/* Main column: on lg, only this area scrolls so the sidebar stays put */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top header — hidden on mobile while a menu/overlay is open */}
        <header
          className={`z-30 shrink-0 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 ${
            hideGlobalMobileHeader ? 'hidden lg:block' : ''
          }`}
        >
          <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <div className="hidden lg:block">
                <FogWordmark size="sm" />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative hidden min-w-0 sm:block">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search size={16} className="text-slate-400" />
                </div>
                <input
                  type="search"
                  placeholder="Search"
                  className="w-40 rounded-full border-0 bg-slate-100 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 md:w-56 lg:w-72"
                  aria-label="Search"
                />
              </div>

              <button
                type="button"
                onClick={() => navigate('/bookmarks')}
                className={`rounded-full p-2 transition-colors hover:bg-slate-100 ${
                  isActive('/bookmarks')
                    ? 'text-[#2563eb] bg-slate-100'
                    : 'text-slate-500 hover:text-[#2563eb]'
                }`}
                aria-label="Bookmarks"
                title="Bookmarked podcasts"
              >
                <Bookmark size={20} />
              </button>

              <NotificationBell onInteract={() => setProfileOpen(false)} />

              {currentUser ? (
                <div className="relative profile-dropdown shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(!profileOpen);
                      closeNotifications();
                    }}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-0.5 pl-1 pr-2 text-left shadow-sm hover:border-slate-300 hover:bg-slate-50"
                    aria-expanded={profileOpen}
                    aria-haspopup="menu"
                    aria-label="Account menu"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563eb]/10 text-xs font-semibold text-[#2563eb]">
                      {userInitials}
                    </span>
                    <span className="hidden max-w-[7rem] truncate text-sm font-medium text-slate-800 sm:block">
                      {displayName}
                    </span>
                  </button>
                  {profileOpen && (
                    <>
                    {createPortal(
                      <div className="profile-mobile-overlay fixed inset-0 z-[100] flex flex-col bg-white lg:hidden">
                        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 px-4">
                          <button
                            type="button"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                          >
                            <ArrowLeft size={20} />
                            <span>Back</span>
                          </button>
                          <h3 className="text-lg font-semibold text-gray-900">Account</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                          <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                            <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                            <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
                          </div>
                          {isAdmin() && (
                            <Link
                              to="/admin"
                              onClick={() => setProfileOpen(false)}
                              className="mb-2 flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <LayoutDashboard size={18} className="text-slate-500" />
                              Admin
                            </Link>
                          )}
                          <LegalFooterLinks
                            variant="menu"
                            className="mb-2 border-t border-slate-100 pt-2"
                            onNavigate={() => setProfileOpen(false)}
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              setProfileOpen(false);
                              try {
                                await logout();
                              } finally {
                                navigate('/login', { replace: true });
                              }
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <LogOut size={18} className="text-slate-500" />
                            Sign out
                          </button>
                        </div>
                      </div>,
                      document.body
                    )}
                    <div
                      className="absolute right-0 mt-2 hidden w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg lg:block z-50"
                      role="menu"
                    >
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                        <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
                      </div>
                      {isAdmin() && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                          role="menuitem"
                        >
                          <LayoutDashboard size={16} className="text-slate-500" />
                          Admin
                        </Link>
                      )}
                      <LegalFooterLinks
                        variant="menu"
                        className="border-t border-slate-100 py-1"
                        onNavigate={() => setProfileOpen(false)}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          setProfileOpen(false);
                          try {
                            await logout();
                          } finally {
                            navigate('/login', { replace: true });
                          }
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                        role="menuitem"
                      >
                        <LogOut size={16} className="text-slate-500" />
                        Sign out
                      </button>
                    </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    to="/login"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-[#2563eb] px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <main
          ref={mainRef}
          className={`min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] touch-pan-y p-4 sm:p-6 lg:px-8 lg:py-6 ${
            audioPlayerActive ? 'pb-[4.75rem] sm:pb-32' : ''
          }`}
        >
          <div className="mx-auto max-w-none xl:max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

const Layout = ({ children }) => (
  <AudioPlayerProvider>
    <LayoutShell>{children}</LayoutShell>
  </AudioPlayerProvider>
);

export default Layout; 