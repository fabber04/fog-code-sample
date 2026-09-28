import React from 'react';

// ─── Reusable skeleton pulse block ───────────────────────────────────────────
const Skeleton = ({ width = '100%', height = 16, radius = 8, style = {} }) => (
  <div
    style={{
      width,
      height,
      borderRadius: radius,
      background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      flexShrink: 0,
      ...style,
    }}
  />
);

// ─── Hero banner skeleton ─────────────────────────────────────────────────────
const HeroSkeleton = () => (
  <div style={{
    borderRadius: 16,
    background: 'linear-gradient(135deg, #c4b5e0 0%, #a78bca 100%)',
    padding: '2rem 1.5rem',
    margin: '0 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    minHeight: 220,
  }}>
    <Skeleton width="80%" height={28} radius={6} style={{ background: 'rgba(255,255,255,0.3)', backgroundSize: '200% 100%' }} />
    <Skeleton width="90%" height={12} radius={4} style={{ background: 'rgba(255,255,255,0.2)', backgroundSize: '200% 100%' }} />
    <Skeleton width="70%" height={12} radius={4} style={{ background: 'rgba(255,255,255,0.2)', backgroundSize: '200% 100%' }} />
    <Skeleton width="60%" height={12} radius={4} style={{ background: 'rgba(255,255,255,0.2)', backgroundSize: '200% 100%' }} />
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Skeleton width="100%" height={44} radius={24} style={{ background: 'rgba(255,255,255,0.4)', backgroundSize: '200% 100%' }} />
      <Skeleton width="100%" height={44} radius={24} style={{ background: 'rgba(255,255,255,0.25)', backgroundSize: '200% 100%' }} />
    </div>
  </div>
);

// ─── Quick access grid skeleton ───────────────────────────────────────────────
const QuickAccessSkeleton = () => (
  <div style={{ padding: '0 1rem' }}>
    {/* Section title */}
    <div style={{ marginBottom: 16 }}>
      <Skeleton width="40%" height={22} radius={6} style={{ marginBottom: 8 }} />
      <Skeleton width="65%" height={14} radius={4} />
    </div>

    {/* Grid of cards */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 12,
    }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          background: 'white',
          borderRadius: 14,
          padding: '1.25rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <Skeleton width={48} height={48} radius={12} />
          <Skeleton width="60%" height={13} radius={4} />
        </div>
      ))}
    </div>
  </div>
);

// ─── Recent podcasts skeleton ─────────────────────────────────────────────────
const PodcastRowSkeleton = () => (
  <div style={{ padding: '0 1rem' }}>
    <div style={{ marginBottom: 14 }}>
      <Skeleton width="45%" height={20} radius={6} style={{ marginBottom: 6 }} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'white', borderRadius: 12, padding: '0.75rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <Skeleton width={56} height={56} radius={10} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width="75%" height={14} radius={4} />
            <Skeleton width="50%" height={11} radius={4} />
          </div>
          <Skeleton width={32} height={32} radius={16} />
        </div>
      ))}
    </div>
  </div>
);

// ─── Events skeleton ──────────────────────────────────────────────────────────
const EventsRowSkeleton = () => (
  <div style={{ padding: '0 1rem' }}>
    <div style={{ marginBottom: 14 }}>
      <Skeleton width="35%" height={20} radius={6} style={{ marginBottom: 6 }} />
    </div>
    <div style={{ display: 'flex', gap: 12, overflowX: 'hidden' }}>
      {[...Array(2)].map((_, i) => (
        <div key={i} style={{
          minWidth: 200, background: 'white', borderRadius: 14,
          overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <Skeleton width="100%" height={110} radius={0} />
          <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width="80%" height={14} radius={4} />
            <Skeleton width="55%" height={11} radius={4} />
            <Skeleton width="40%" height={11} radius={4} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Full home page skeleton ──────────────────────────────────────────────────
const HomePageSkeleton = () => (
  <div style={{
    minHeight: '100vh',
    background: '#f8fafc',
    paddingBottom: 40,
  }}>
    {/* Navbar skeleton */}
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem 1.25rem',
      background: 'white',
      borderBottom: '1px solid #f1f5f9',
      marginBottom: 16,
    }}>
      <Skeleton width={28} height={20} radius={4} />
      <Skeleton width={120} height={18} radius={4} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Skeleton width={28} height={28} radius={14} />
        <Skeleton width={60} height={32} radius={16} />
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <HeroSkeleton />
      <QuickAccessSkeleton />
      <PodcastRowSkeleton />
      <EventsRowSkeleton />
    </div>

    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

export default HomePageSkeleton;
