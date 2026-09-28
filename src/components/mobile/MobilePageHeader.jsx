import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const MobilePageHeader = ({
  title,
  icon: Icon,
  onBack,
  backLabel = 'Back to home',
  showBackLabel = false,
  rightSlot = null,
  alwaysVisible = false,
}) => {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate('/'));

  return (
    <div
      className={`sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-3 ${
        alwaysVisible ? '' : 'lg:hidden'
      }`}
    >
      <button
        type="button"
        onClick={handleBack}
        className={
          showBackLabel
            ? 'flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100'
            : 'flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-colors hover:bg-gray-50'
        }
        aria-label={backLabel}
      >
        <ChevronLeft size={showBackLabel ? 20 : 22} />
        {showBackLabel && <span>Back</span>}
      </button>

      {(title || Icon) && (
        <div className="flex items-center gap-2 text-gray-900">
          {Icon && <Icon size={18} className="text-[#2563eb]" />}
          {title && (
            <span className="max-w-[12rem] truncate text-base font-semibold">{title}</span>
          )}
        </div>
      )}

      <div className="flex w-10 justify-end">{rightSlot}</div>
    </div>
  );
};

export default MobilePageHeader;
