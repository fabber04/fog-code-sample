import React from 'react';
import {
  BookOpen,
  Bookmark,
  Star,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import MobilePageHeader from '../components/mobile/MobilePageHeader';
import MobilePageNotificationBell from '../components/notifications/MobilePageNotificationBell';
import MobileListCard from '../components/mobile/MobileListCard';

const Library = () => {
  const resources = [
    {
      id: 'books',
      title: 'Complete Book Collection',
      subtitle: 'Wisdom Library',
      description:
        'Browse, purchase, and download spiritual books and devotionals from our dedicated book platform.',
      actionLabel: 'Visit',
      onAction: () => window.open('https://wisdomlibrary.co.zw/', '_blank'),
    },
    {
      id: 'blogs',
      title: 'Blog Articles',
      subtitle: 'Faith & growth',
      description: 'Read our latest blog posts on faith, relationships, and spiritual growth.',
      actionLabel: 'Read',
    },
    {
      id: 'quotes',
      title: 'Quotes',
      subtitle: 'Daily wisdom',
      description: 'Get inspired with daily wisdom quotes and scripture.',
      actionLabel: 'View',
    },
    {
      id: 'youth',
      title: 'Wisdom For Youth Blogs',
      subtitle: 'Youth focus',
      description: 'Articles and insights written for young people navigating life with purpose.',
      actionLabel: 'Explore',
    },
  ];

  return (
    <div className="min-h-full bg-white lg:min-h-screen lg:bg-gray-50 lg:py-8">
      <MobilePageHeader title="Library" icon={BookOpen} rightSlot={<MobilePageNotificationBell />} />

      <div className="lg:hidden">
        <div className="border-b border-gray-100 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-4 py-8 text-white">
          <BookOpen className="mb-3 h-10 w-10" />
          <h2 className="text-xl font-bold">Digital Library</h2>
          <p className="mt-2 text-sm text-white/90">
            Spiritual books, blogs, quotes, and youth resources in one place.
          </p>
          <button
            type="button"
            onClick={() => window.open('https://wisdomlibrary.co.zw/', '_blank')}
            className="mt-4 inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#2563eb]"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Visit Book Website
          </button>
        </div>
        <div className="px-4 pt-6 pb-8">
          {resources.slice(1).map((item) => (
            <MobileListCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              description={item.description}
              actionLabel={item.actionLabel}
              onAction={item.onAction}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto hidden max-w-7xl px-4 sm:px-6 lg:block lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Digital Library</h1>
          <p className="mt-2 text-gray-600">
            Access our complete collection of spiritual resources and books
          </p>
        </div>

        <div className="mb-8 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-white">
          <div className="text-center">
            <BookOpen className="mx-auto mb-4 h-16 w-16" />
            <h2 className="mb-4 text-2xl font-bold">Complete Book Collection</h2>
            <p className="mx-auto mb-6 max-w-2xl text-lg">
              Discover our full library of spiritual books, devotionals, and resources.
            </p>
            <button
              type="button"
              onClick={() => window.open('https://wisdomlibrary.co.zw/', '_blank')}
              className="mx-auto flex items-center rounded-lg bg-white px-8 py-4 font-medium text-primary-600 transition-colors hover:bg-gray-100"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Visit Our Book Website
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Additional Resources</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <Bookmark className="mx-auto mb-4 h-12 w-12 text-green-600" />
              <h3 className="mb-2 text-center text-lg font-semibold text-gray-900">Blog Articles</h3>
              <p className="text-center text-gray-600">Read our latest blog posts on faith and growth</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <Star className="mx-auto mb-4 h-12 w-12 text-yellow-600" />
              <h3 className="mb-2 text-center text-lg font-semibold text-gray-900">Quotes</h3>
              <p className="text-center text-gray-600">Daily wisdom quotes and scripture</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-blue-600" />
              <h3 className="mb-2 text-center text-lg font-semibold text-gray-900">Wisdom For Youth Blogs</h3>
              <p className="text-center text-gray-600">Youth-focused articles and insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;
