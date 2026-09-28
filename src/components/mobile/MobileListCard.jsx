import React from 'react';

const MobileListCard = ({
  image,
  imageAlt,
  badge,
  title,
  subtitle,
  description,
  actionLabel = 'Details',
  onAction,
  onClick,
  imageClassName = 'aspect-[16/10] w-full',
  imageFit = 'contain',
  compact = false,
}) => (
  <article
    className={
      compact
        ? 'text-left'
        : 'border-b border-gray-100 pb-8 last:border-b-0'
    }
    onClick={onClick}
    onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    {image && (
      <div
        className={`relative overflow-hidden shadow-sm ${
          compact ? 'mb-2 rounded-xl' : 'mb-4 rounded-2xl'
        } ${onClick ? 'cursor-pointer' : ''}`}
      >
        <div className="relative overflow-hidden rounded-[inherit] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <img
            src={image}
            alt={imageAlt || title}
            className={`${imageClassName} ${
              imageFit === 'cover' ? 'object-cover' : 'object-contain p-2'
            }`}
            loading="lazy"
          />
        </div>
        {badge && (
          <div className="absolute bottom-3 left-3 min-w-[3.25rem] rounded-xl bg-black/75 px-2.5 py-2 text-center text-white backdrop-blur-sm">
            <div className="text-base font-bold leading-tight">{badge.line1}</div>
            {badge.line2 && (
              <div className="text-[10px] font-medium uppercase tracking-wide text-white/90">
                {badge.line2}
              </div>
            )}
          </div>
        )}
      </div>
    )}

    <h2
      className={
        compact
          ? 'text-sm font-semibold leading-snug tracking-tight text-gray-900'
          : 'text-xl font-bold tracking-tight text-gray-900'
      }
    >
      {title}
    </h2>
    {subtitle && (
      <p className={`font-medium text-gray-500 ${compact ? 'mt-0.5 text-xs' : 'mt-1 text-sm'}`}>
        {subtitle}
      </p>
    )}
    {!compact && description && (
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{description}</p>
    )}

    {!compact && onAction && (
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAction(e);
          }}
          className="rounded-full bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-200"
        >
          {actionLabel}
        </button>
      </div>
    )}
  </article>
);

export default MobileListCard;
