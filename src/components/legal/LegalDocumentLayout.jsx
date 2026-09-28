import React from 'react';
import { useNavigate } from 'react-router-dom';
import MobilePageHeader from '../mobile/MobilePageHeader';
import LegalFooterLinks from './LegalFooterLinks';
import { LEGAL } from '../../constants/legalConfig';

const LegalDocumentLayout = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-white">
      <MobilePageHeader
        title={title}
        onBack={() => navigate(-1)}
        backLabel="Back"
        showBackLabel
        alwaysVisible
      />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] touch-pan-y">
        <article className="mx-auto max-w-3xl px-4 py-6 pb-16 sm:px-6 lg:py-10">
          <header className="mb-8 border-b border-gray-100 pb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm text-slate-500">
              {LEGAL.appName} · Last updated {LEGAL.lastUpdated}
            </p>
          </header>
          <div className="legal-prose space-y-6 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
            {children}
          </div>
          <footer className="mt-10 border-t border-gray-100 pt-6">
            <LegalFooterLinks className="text-center" />
            <p className="mt-3 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} {LEGAL.legalEntity}
            </p>
          </footer>
        </article>
      </main>
    </div>
  );
};

export default LegalDocumentLayout;
