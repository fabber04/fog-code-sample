import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { eventService, podcastService, memberService, prayerService, libraryService } from '../services/apiService';
import {
  Calendar, Headphones, FileText, Users, UserCheck,
  Heart, BookOpen, GraduationCap,
  HeartHandshake, Activity, Bell, TrendingUp, ChevronRight,
  BookMarked,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, admins: 0, recent: 0, loading: true },
    prayer: { total: 0, pending: 0, answered: 0, recent: 0, loading: true },
    content: {
      events: { total: 0, loading: true },
      podcasts: { total: 0, loading: true },
      library: { total: 0, loading: true }
    }
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => { loadAllStatistics(); }, []);

  const loadAllStatistics = async () => {
    try {
      setLoading(true);
      const [userStats, prayerStats, eventsData, podcastsData, libraryData] = await Promise.all([
        memberService.getUserStats().catch(() => ({ total_users: 0, active_users: 0, admin_users: 0, recent_registrations: 0 })),
        prayerService.getPrayerStats().catch(() => ({ total_requests: 0, pending_requests: 0, answered_requests: 0 })),
        eventService.getEvents().catch(() => []),
        podcastService.getPodcasts().catch(() => []),
        libraryService.getLibraryItems().catch(() => [])
      ]);
      setStats({
        users: { total: userStats.total_users || 0, active: userStats.active_users || 0, admins: userStats.admin_users || 0, recent: userStats.recent_registrations || 0, loading: false },
        prayer: { total: prayerStats.total_requests || 0, pending: prayerStats.pending_requests || 0, answered: prayerStats.answered_requests || 0, loading: false },
        content: {
          events: { total: eventsData.length || 0, loading: false },
          podcasts: { total: podcastsData.length || 0, loading: false },
          library: { total: libraryData.length || 0, loading: false }
        }
      });
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalContent = stats.content.events.total + stats.content.podcasts.total + stats.content.library.total;

  const quickStats = [
    { label: 'Total Members', value: stats.users.total, sub: stats.users.recent > 0 ? `+${stats.users.recent} this month` : 'No new this month', icon: Users, color: '#2563eb', bg: '#eff6ff', loading: stats.users.loading },
    { label: 'Active Users', value: stats.users.active, sub: 'Currently active', icon: UserCheck, color: '#16a34a', bg: '#f0fdf4', loading: stats.users.loading },
    { label: 'Prayer Requests', value: stats.prayer.total, sub: stats.prayer.pending > 0 ? `${stats.prayer.pending} pending` : 'All handled', icon: Heart, color: '#dc2626', bg: '#fef2f2', loading: stats.prayer.loading },
    { label: 'Total Content', value: totalContent, sub: `${stats.content.podcasts.total} podcasts`, icon: FileText, color: '#7c3aed', bg: '#f5f3ff', loading: loading },
  ];

  const sections = useMemo(() => [
    { id: 'notifications', title: 'Bell Notifications', desc: 'Push to all users', icon: Bell, path: '/admin/notifications', color: '#1e293b', bg: 'linear-gradient(135deg, #1e293b, #334155)' },
    { id: 'podcasts', title: 'Podcasts', desc: `${stats.content.podcasts.total} episodes`, icon: Headphones, path: '/admin/podcasts', color: '#7c3aed', bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)' },
    { id: 'events', title: 'Events', desc: `${stats.content.events.total} upcoming`, icon: Calendar, path: '/admin/events', color: '#2563eb', bg: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
    { id: 'library', title: 'Library', desc: `${stats.content.library.total} resources`, icon: BookOpen, path: '/admin/library', color: '#0891b2', bg: 'linear-gradient(135deg, #0891b2, #0e7490)' },
    { id: 'genius-academy', title: 'Genius Academy', desc: 'Manage courses', icon: GraduationCap, path: '/admin/masterclass', color: '#d97706', bg: 'linear-gradient(135deg, #d97706, #b45309)' },
    { id: 'counseling', title: 'Counseling', desc: 'View sessions', icon: HeartHandshake, path: '/admin/counseling', color: '#db2777', bg: 'linear-gradient(135deg, #db2777, #be185d)' },
    { id: 'devotionals', title: 'Devotionals', desc: 'Daily content', icon: BookMarked, path: '/admin/devotionals', color: '#0d9488', bg: 'linear-gradient(135deg, #0d9488, #0f766e)' },
    { id: 'members', title: 'Members', desc: `${stats.users.total} total`, icon: Users, path: '/members', color: '#16a34a', bg: 'linear-gradient(135deg, #16a34a, #15803d)' },
    { id: 'prayer', title: 'Prayer Requests', desc: `${stats.prayer.pending} pending`, icon: Heart, path: '/prayer-requests', color: '#dc2626', bg: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
  ], [stats]);

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Overview"
      onRefresh={loadAllStatistics}
      refreshing={loading}
    >
      {/* Greeting */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {getGreeting()} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here&apos;s what&apos;s happening at FOG today.
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </p>
                  {stat.loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                  ) : (
                    <p className="text-3xl font-extrabold leading-none text-slate-900">
                      {stat.value}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-slate-400">{stat.sub}</p>
                </div>
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: stat.bg }}
                >
                  <Icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manage Content header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">Manage Content</h2>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Activity className="h-3.5 w-3.5" />
          <span>Updated {lastRefresh.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Tile grid — 3 columns */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.id} to={section.path} className="group block no-underline">
              <div
                className="flex h-full flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md"
                style={{ '--tile-color': section.color }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${section.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '';
                }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: section.bg }}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{section.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{section.desc}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Platform summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <TrendingUp className="h-[18px] w-[18px] text-primary-600" />
          <h2 className="text-base font-bold text-slate-900">Platform Summary</h2>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { label: 'Events', value: stats.content.events.total, loading: stats.content.events.loading },
            { label: 'Podcasts', value: stats.content.podcasts.total, loading: stats.content.podcasts.loading },
            { label: 'Library Items', value: stats.content.library.total, loading: stats.content.library.loading },
            { label: 'Administrators', value: stats.users.admins, loading: stats.users.loading },
          ].map((item) => (
            <div key={item.label}>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                {item.label}
              </p>
              {item.loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
              ) : (
                <p className="text-2xl font-extrabold text-slate-900">{item.value}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
