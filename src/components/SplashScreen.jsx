import { useState, useEffect } from 'react';

const FOG_NAVY = '#0f1f3d';
const FOG_ORANGE = '#f97316';
const POSTER_URL = `${process.env.PUBLIC_URL}/images/splash/fog-welcome-poster.png`;

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

const DotDivider = ({ variant = 'dark' }) => {
  const isDark = variant === 'dark';
  const line = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(249,115,22,0.45)';
  const sideDot = isDark ? 'rgba(255,255,255,0.5)' : FOG_ORANGE;
  const centerDot = isDark ? FOG_ORANGE : FOG_NAVY;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: '100%',
        maxWidth: 200,
        margin: '0 auto',
      }}
      aria-hidden
    >
      <div style={{ flex: 1, height: 1, background: line }} />
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: sideDot }} />
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: centerDot }} />
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: sideDot }} />
      <div style={{ flex: 1, height: 1, background: line }} />
    </div>
  );
};

const fadeUp = (visible, delay = 0) => ({
  opacity: visible ? 1 : 0,
  transform: visible ? 'translateY(0)' : 'translateY(14px)',
  transition: `opacity 0.7s ${EASE_OUT} ${delay}ms, transform 0.7s ${EASE_OUT} ${delay}ms`,
});

const SplashScreen = ({ onComplete, onExitStart }) => {
  const [phase, setPhase] = useState('intro');

  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Inter:wght@500;600;700&display=swap';
    document.head.appendChild(link);

    const t1 = setTimeout(() => setPhase('logo'), 200);
    const t2 = setTimeout(() => setPhase('tagline'), 1050);
    const t3 = setTimeout(() => {
      setPhase('out');
      onExitStart?.();
    }, 2900);
    const t4 = setTimeout(() => onComplete?.(), 3800);

    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      link.remove();
    };
  }, [onComplete, onExitStart]);

  const isExiting = phase === 'out';
  const showTop = phase !== 'intro';
  const showBottom = phase === 'tagline' || isExiting;

  return (
    <div
      aria-hidden={isExiting}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        opacity: isExiting ? 0 : 1,
        transition: `opacity 0.9s ${EASE_OUT}`,
        overflow: 'hidden',
        pointerEvents: isExiting ? 'none' : 'auto',
      }}
    >
      {/* Top — navy welcome card */}
      <div
        style={{
          flex: '1 1 54%',
          display: 'flex',
          flexDirection: 'column',
          padding: 'max(14px, env(safe-area-inset-top)) 18px 0',
          minHeight: 0,
        }}
      >
        <section
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '28px 24px 32px',
            background: FOG_NAVY,
            borderRadius: 40,
            boxShadow:
              '0 4px 6px rgba(15,31,61,0.04), 0 16px 40px rgba(15,31,61,0.14), 0 0 0 1px rgba(15,31,61,0.06)',
            overflow: 'hidden',
            isolation: 'isolate',
            transform: 'translateZ(0)',
            WebkitBackfaceVisibility: 'hidden',
            clipPath: 'inset(0 round 40px)',
          }}
        >
        {/* Background layers */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 40,
            backgroundImage: `url(${process.env.PUBLIC_URL}/images/events/Weekly Services.jpeg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            opacity: 0.14,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 40,
            background: `linear-gradient(165deg, rgba(15,31,61,0.94) 0%, rgba(15,31,61,0.88) 55%, rgba(15,31,61,0.96) 100%)`,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-30%',
            width: '80%',
            height: '60%',
            background: `radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${FOG_ORANGE}, transparent)`,
            opacity: 0.85,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 300,
            textAlign: 'center',
          }}
        >
          {/* Logo */}
          <div style={fadeUp(showTop, 0)}>
            <div
              style={{
                position: 'relative',
                width: 100,
                height: 100,
                margin: '0 auto 22px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: -4,
                  borderRadius: '50%',
                  border: `1px solid rgba(249,115,22,0.35)`,
                }}
              />
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: '#fff',
                  padding: 3,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={POSTER_URL}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    objectPosition: 'center 12%',
                  }}
                />
              </div>
            </div>
          </div>

          <p
            style={{
              margin: 0,
              ...fadeUp(showTop, 120),
              fontFamily: "'Dancing Script', cursive",
              fontSize: 'clamp(2.2rem, 10vw, 2.75rem)',
              fontWeight: 700,
              lineHeight: 1,
              color: FOG_ORANGE,
            }}
          >
            Welcome to
          </p>

          <div style={{ margin: '16px 0 18px', ...fadeUp(showTop, 200) }}>
            <DotDivider variant="dark" />
          </div>

          <h1
            style={{
              margin: 0,
              ...fadeUp(showTop, 280),
              fontFamily: "'Libre Baskerville', Georgia, serif",
              fontSize: 'clamp(1.25rem, 5.8vw, 1.55rem)',
              fontWeight: 700,
              letterSpacing: '0.14em',
              lineHeight: 1.25,
              color: '#fff',
              textTransform: 'uppercase',
            }}
          >
            Family of Greatness
          </h1>
        </div>
        </section>
      </div>

      {/* Bottom — white vision */}
      <section
        style={{
          flex: '1 1 46%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '28px 32px max(24px, env(safe-area-inset-bottom))',
          background: '#fff',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: 0,
            ...fadeUp(showBottom, 0),
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: FOG_NAVY,
          }}
        >
          The Home of Great People
        </p>

        <div style={{ margin: '16px 0 20px', width: '100%', ...fadeUp(showBottom, 80) }}>
          <DotDivider variant="light" />
        </div>

        <p
          style={{
            margin: 0,
            ...fadeUp(showBottom, 160),
            fontFamily: "'Libre Baskerville', Georgia, serif",
            fontSize: 'clamp(1.3rem, 5.5vw, 1.5rem)',
            fontWeight: 700,
            lineHeight: 1.45,
            color: FOG_ORANGE,
            maxWidth: 280,
          }}
        >
          Raising great people for global impact.
        </p>

        {/* Subtle brand mark */}
        <div
          style={{
            marginTop: 22,
            ...fadeUp(showBottom, 240),
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          aria-hidden
        >
          <div style={{ width: 18, height: 1, background: 'rgba(249,115,22,0.4)' }} />
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: FOG_ORANGE }} />
          <div style={{ width: 18, height: 1, background: 'rgba(249,115,22,0.4)' }} />
        </div>

        {/* Loading bar */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 28,
            width: '100%',
            maxWidth: 120,
            ...fadeUp(showBottom, 320),
          }}
          aria-hidden
        >
          <div
            style={{
              height: 2,
              borderRadius: 999,
              background: 'rgba(15,31,61,0.08)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: '100%',
                background: FOG_ORANGE,
                transformOrigin: 'left center',
                animation: showBottom && !isExiting ? 'fogSplashLoad 1.8s ease-in-out infinite' : 'none',
              }}
            />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fogSplashLoad {
          0% { transform: scaleX(0.15); opacity: 0.5; }
          50% { transform: scaleX(0.85); opacity: 1; }
          100% { transform: scaleX(0.15); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
