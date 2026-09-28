import React from 'react';

const VARIANTS = {
  card: 'aspect-square',
  featured: 'aspect-square max-h-80',
  dashboard: 'aspect-square',
  banner: 'aspect-[16/10] w-full',
};

const IMG_CLASSES = {
  card: 'absolute inset-0 h-full w-full object-cover object-center',
  featured: 'absolute inset-0 h-full w-full object-cover object-center',
  dashboard: 'absolute inset-0 h-full w-full object-cover object-center',
  banner: 'absolute inset-0 w-full h-full object-cover object-center',
};

const EventImage = ({ src, alt, variant = 'card', className = '' }) => (
  <div
    className={`relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${VARIANTS[variant] || VARIANTS.card} ${className}`}
  >
    <img
      src={src}
      alt={alt}
      className={IMG_CLASSES[variant] || IMG_CLASSES.card}
      loading="lazy"
    />
  </div>
);

export default EventImage;
