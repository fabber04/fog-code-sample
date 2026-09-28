import React from 'react';
import { BookOpen } from 'lucide-react';
import MobilePageHeader from '../components/mobile/MobilePageHeader';
import MobilePageNotificationBell from '../components/notifications/MobilePageNotificationBell';

const Devotionals = () => (
  <div className="min-h-full bg-white lg:min-h-0">
    <MobilePageHeader title="Devotionals" icon={BookOpen} rightSlot={<MobilePageNotificationBell />} />

    <div className="px-4 py-12 lg:hidden">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
          <BookOpen size={48} className="text-gray-400" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-800">Coming Soon</h2>
        <p className="text-sm leading-relaxed text-gray-500">
          Relationship devotionals and faith-based guidance are being prepared for you.
        </p>
      </div>
    </div>

    <div className="hidden space-y-6 lg:block">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Relationship Devotionals</h1>
        <p className="mt-1 text-gray-600">
          Strengthen your relationships through faith-based devotionals and guidance
        </p>
      </div>
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <BookOpen size={48} className="text-gray-400" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-gray-700">Under Construction</h2>
          <p className="text-gray-500">This section is being developed and will be available soon.</p>
        </div>
      </div>
    </div>
  </div>
);

export default Devotionals;
