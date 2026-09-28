import React from 'react';

/** FOG logo mark — clean wordmark inspired by minimalist community UIs */
const FogWordmark = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: { main: 'text-lg', rest: 'text-lg' },
    md: { main: 'text-2xl', rest: 'text-2xl' },
    lg: { main: 'text-3xl', rest: 'text-3xl' },
  };
  const s = sizes[size] || sizes.md;
  return (
    <div
      className={`inline-flex items-baseline font-semibold tracking-tight select-none ${className}`}
      aria-hidden
    >
      <span className={`${s.main} text-[#1e3a5f]`}>F</span>
      <span className={`${s.rest} text-slate-800 -ml-px`}>OG</span>
    </div>
  );
};

export default FogWordmark;
