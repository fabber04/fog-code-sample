import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Headphones, GraduationCap, HeartHandshake, Library } from 'lucide-react';
import { markOnboardingComplete } from '../utils/onboarding';

const steps = [
  {
    title: 'Explore the Library',
    description: 'Read and download resources curated for your growth.',
    href: '/library',
    icon: Library,
  },
  {
    title: 'Listen to Podcasts',
    description: 'Stay encouraged with teachings you can take anywhere.',
    href: '/podcasts',
    icon: Headphones,
  },
  {
    title: 'Join Events',
    description: 'Find gatherings, sessions, and ministry moments.',
    href: '/events',
    icon: Calendar,
  },
  {
    title: 'Genius Academy',
    description: 'Level up through masterclasses and mentorship resources.',
    href: '/masterclass',
    icon: GraduationCap,
  },
  {
    title: 'Counseling',
    description: 'Get support and guidance for relationships and life.',
    href: '/counseling',
    icon: HeartHandshake,
  },
  {
    title: 'Devotionals',
    description: 'Start small daily habits that build strong faith.',
    href: '/devotionals',
    icon: BookOpen,
  },
];

export default function Onboarding({ onComplete }) {
  const navigate = useNavigate();
  const tourRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [tourStarted, setTourStarted] = useState(false);

  const scrollToTour = useCallback(() => {
    setTourStarted(true);
    requestAnimationFrame(() => {
      const tourEl = tourRef.current;
      const main = document.querySelector('main');
      if (tourEl && main) {
        const top =
          tourEl.getBoundingClientRect().top -
          main.getBoundingClientRect().top +
          main.scrollTop;
        main.scrollTo({ top: Math.max(0, top - 12), behavior: 'smooth' });
      } else {
        tourEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, []);

  const finishOnboarding = useCallback(
    (destination = '/') => {
      if (busy) return;
      setBusy(true);
      markOnboardingComplete();
      onComplete?.();
      navigate(destination, { replace: true });
      setBusy(false);
    },
    [busy, navigate, onComplete]
  );

  const exploreSection = useCallback(
    (href) => {
      if (busy) return;
      setBusy(true);
      markOnboardingComplete();
      onComplete?.();
      navigate(href, { replace: true });
      setBusy(false);
    },
    [busy, navigate, onComplete]
  );

  return (
    <div className="fade-in">
      <div className="rounded-3xl overflow-hidden shadow-medium border border-white/50">
        <div className="gradient-bg p-8 lg:p-12 text-white relative">
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-shadow">
              Welcome to Family of Greatness
            </h1>
            <p className="mt-4 text-white/90 text-base lg:text-xl">
              {tourStarted
                ? 'Explore a section below, then head to your dashboard when you are ready.'
                : 'New here? Start with a quick tour of the app, or skip straight to your dashboard.'}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={scrollToTour}
                disabled={busy}
                className="btn-primary focus-ring disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {tourStarted ? 'Back to tour' : 'Get started'}
              </button>
              <button
                type="button"
                onClick={() => finishOnboarding('/')}
                disabled={busy}
                className="inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold border-2 border-white text-white hover:bg-white hover:text-primary-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy ? 'Opening…' : 'Skip for now'}
              </button>
            </div>
          </div>
        </div>

        <div
          ref={tourRef}
          id="quick-tour"
          className={`bg-white p-6 lg:p-10 transition-all duration-500 ${
            tourStarted ? 'ring-2 ring-inset ring-primary-400/40 bg-primary-50/30' : ''
          }`}
        >
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Quick tour</h2>
          <p className="mt-2 text-gray-600">
            Tap a section to open it, or continue to your dashboard when you are done browsing.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => exploreSection(s.href)}
                  disabled={busy}
                  className="card-hover rounded-2xl border border-gray-100 bg-white p-5 lg:p-6 hover:shadow-xl text-left disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="text-primary-700" size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900">{s.title}</div>
                      <div className="mt-1 text-sm text-gray-600">{s.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => finishOnboarding('/')}
              disabled={busy}
              className="btn-primary focus-ring disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? 'Opening…' : 'Continue to dashboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
