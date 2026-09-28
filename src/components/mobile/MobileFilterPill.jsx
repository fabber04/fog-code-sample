import React from 'react';
import { ChevronDown } from 'lucide-react';

const MobileFilterPill = ({ value, onChange, options, label = 'Filter' }) => (
  <div className="border-b border-gray-100 px-4 py-3 lg:hidden">
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-full border border-gray-200 bg-gray-50 py-2 pl-4 pr-9 text-sm font-medium text-gray-800 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
        aria-label={label}
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
      />
    </div>
  </div>
);

export default MobileFilterPill;
