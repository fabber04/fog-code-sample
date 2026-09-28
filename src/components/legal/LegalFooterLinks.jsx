import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield } from 'lucide-react';

/**
 * Shared Terms / Privacy links — use across auth, sidebar, and account menu.
 */
export function LegalFooterLinks({ variant = 'inline', className = '', onNavigate }) {
  const linkClass =
    variant === 'menu'
      ? 'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50'
      : 'text-slate-500 hover:text-slate-700 hover:underline transition-colors';

  const handleClick = () => {
    if (onNavigate) onNavigate();
  };

  if (variant === 'menu') {
    return (
      <div className={className}>
        <p className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Legal
        </p>
        <Link to="/terms" onClick={handleClick} className={linkClass} role="menuitem">
          <FileText size={16} className="shrink-0 text-slate-400" />
          Terms of Service
        </Link>
        <Link to="/privacy" onClick={handleClick} className={linkClass} role="menuitem">
          <Shield size={16} className="shrink-0 text-slate-400" />
          Privacy Policy
        </Link>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={`space-y-2 text-center ${className}`}>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px]">
          <Link to="/terms" className={linkClass}>
            Terms
          </Link>
          <span className="text-slate-300" aria-hidden>
            ·
          </span>
          <Link to="/privacy" className={linkClass}>
            Privacy
          </Link>
        </div>
        <p className="text-[10px] text-slate-400">FOG · Zimbabwe &amp; beyond</p>
      </div>
    );
  }

  // inline — auth screens, compact footers
  return (
    <p className={`text-xs text-slate-500 ${className}`}>
      <Link to="/terms" onClick={handleClick} className="font-medium text-slate-600 hover:text-[#2563eb] hover:underline">
        Terms
      </Link>
      {' · '}
      <Link to="/privacy" onClick={handleClick} className="font-medium text-slate-600 hover:text-[#2563eb] hover:underline">
        Privacy
      </Link>
    </p>
  );
}

export default LegalFooterLinks;
