import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { EVENT_IMAGES } from '../constants/eventImages';
import EventImage from '../components/EventImage';
import MobilePageHeader from '../components/mobile/MobilePageHeader';
import MobilePageNotificationBell from '../components/notifications/MobilePageNotificationBell';
import MobileFilterPill from '../components/mobile/MobileFilterPill';
import MobileListCard from '../components/mobile/MobileListCard';

const Events = () => {
  const isAdmin = () => false;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFullView, setShowFullView] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const categories = [
    { id: 'all', name: 'Upcoming' },
    { id: 'prayer', name: 'Prayer' },
    { id: 'service', name: 'Service' },
    { id: 'devotional', name: 'Devotional' },
    { id: 'empowerment', name: 'Empowerment' },
    { id: 'social', name: 'Social' },
    { id: 'wisdom', name: 'Wisdom Class' },
  ];

  const events = [
    {
      id: 1,
      title: 'Morning Prayers',
      description:
        'Start your day in prayer with the FOG family. Join us online every Monday, Wednesday, and Friday at 4:00 AM.',
      category: 'prayer',
      date: '2024-01-15',
      time: '04:00',
      timeDisplay: '4:00 AM · Mon · Wed · Fri',
      schedule: 'Every Mon · Wed · Fri',
      badge: { line1: '4AM', line2: 'Daily' },
      location: '',
      maxAttendees: 50,
      currentAttendees: 23,
      featured: true,
      image: EVENT_IMAGES.morningPrayers,
    },
    {
      id: 2,
      title: 'Weekly Services',
      description:
        'Come explore the Word with us every Wednesday online. A midweek service to grow in faith and community.',
      category: 'service',
      date: '2024-01-21',
      time: '09:00',
      timeDisplay: '9:00 AM · Every Wednesday',
      schedule: 'Every Wednesday',
      badge: { line1: 'Wed', line2: 'Weekly' },
      location: '',
      maxAttendees: 200,
      currentAttendees: 156,
      featured: true,
      image: EVENT_IMAGES.weeklyServices,
    },
    {
      id: 3,
      title: 'Relationship Thursday',
      description:
        'Healthy relationships taught live every Thursday at 8:00 PM CAT on YouTube with Coach Noble and the FOG team.',
      category: 'devotional',
      date: '2024-01-18',
      time: '20:00',
      timeDisplay: '8:00 PM · Every Thursday',
      schedule: 'Every Thursday',
      badge: { line1: 'Thu', line2: '8 PM' },
      location: '',
      maxAttendees: 80,
      currentAttendees: 45,
      featured: true,
      image: EVENT_IMAGES.relationshipThursday,
    },
    {
      id: 4,
      title: 'Empowerment Nights',
      description:
        'Special empowerment gatherings hosted twice every year — worship, fellowship, and faith-filled celebration with the FOG family.',
      category: 'empowerment',
      date: '2024-01-01',
      time: '',
      timeDisplay: 'Twice every year',
      schedule: 'Dates to be announced',
      badge: { line1: 'FOG', line2: 'Night' },
      location: '',
      maxAttendees: 0,
      currentAttendees: 0,
      featured: true,
      image: EVENT_IMAGES.empowermentNights,
    },
    {
      id: 5,
      title: 'Social Dinner',
      description:
        'An annual social dinner bringing the FOG community together for fellowship, food, and celebration.',
      category: 'social',
      date: '2024-01-01',
      time: '',
      timeDisplay: 'Once every year',
      schedule: 'Dates to be announced',
      badge: { line1: 'Annual', line2: 'Dinner' },
      location: '',
      maxAttendees: 0,
      currentAttendees: 0,
      featured: false,
      image: EVENT_IMAGES.socialDinner,
    },
    {
      id: 6,
      title: 'Wisdom Class',
      description:
        'Monthly wisdom class for spiritual growth, practical living, and biblical insight with the FOG team.',
      category: 'wisdom',
      date: '2024-01-01',
      time: '',
      timeDisplay: 'Once every month',
      schedule: 'Dates to be announced',
      badge: { line1: 'Monthly', line2: 'Class' },
      location: '',
      maxAttendees: 0,
      currentAttendees: 0,
      featured: false,
      image: EVENT_IMAGES.wisdomClass,
    },
  ];

  const ladiesNightPhotos = [
    '/images/ladies-night/IMG-20250810-WA0001.jpg',
    '/images/ladies-night/IMG-20250825-WA0066.jpg',
    '/images/ladies-night/IMG-20250825-WA0067.jpg',
    '/images/ladies-night/IMG-20250825-WA0068.jpg',
    '/images/ladies-night/IMG-20250825-WA0069.jpg',
    '/images/ladies-night/IMG-20250825-WA0071.jpg',
    '/images/ladies-night/IMG-20250825-WA0072.jpg',
    '/images/ladies-night/IMG-20250825-WA0073.jpg',
    '/images/ladies-night/IMG-20250825-WA0074.jpg',
    '/images/ladies-night/IMG-20250825-WA0075.jpg',
  ];

  const getCategoryColor = (category) => {
    const colors = {
      prayer: 'bg-blue-100 text-blue-800',
      service: 'bg-green-100 text-green-800',
      devotional: 'bg-purple-100 text-purple-800',
      empowerment: 'bg-orange-100 text-orange-800',
      social: 'bg-pink-100 text-pink-800',
      wisdom: 'bg-indigo-100 text-indigo-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const photoCount = ladiesNightPhotos.length;

  const goToPrevPhoto = (e) => {
    e?.stopPropagation();
    setCurrentPhotoIndex((i) => (i === 0 ? photoCount - 1 : i - 1));
  };

  const goToNextPhoto = (e) => {
    e?.stopPropagation();
    setCurrentPhotoIndex((i) => (i === photoCount - 1 ? 0 : i + 1));
  };

  return (
    <div className="min-h-full bg-white lg:min-h-screen lg:bg-gray-50 lg:py-8">
      <MobilePageHeader title="Events" icon={Calendar} rightSlot={<MobilePageNotificationBell />} />

      <div className="lg:hidden">
        <MobileFilterPill
          value={filterCategory}
          onChange={setFilterCategory}
          options={categories}
          label="Filter events"
        />
        <div className="px-4 pt-4">
          <div className="mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
            <div
              className="relative h-52 cursor-pointer"
              onClick={() => setShowFullView(true)}
            >
              <img
                src={ladiesNightPhotos[currentPhotoIndex]}
                alt="Empowerment night highlight"
                className="pointer-events-none h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="mb-1 inline-flex rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">
                  Latest Event
                </span>
                <h2 className="text-base font-bold">Empowerment night 08 Highlights</h2>
              </div>
              <button
                type="button"
                onClick={goToPrevPhoto}
                className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goToNextPhoto}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
                {currentPhotoIndex + 1} / {photoCount}
              </span>
            </div>
          </div>
          {filteredEvents.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No events in this category.</p>
          ) : (
            filteredEvents.map((event) => (
              <MobileListCard
                key={event.id}
                image={event.image}
                imageAlt={event.title}
                badge={event.badge}
                title={event.title}
                subtitle={event.timeDisplay}
                description={event.description}
                actionLabel="Details"
                imageFit="cover"
              />
            ))
          )}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="mx-auto hidden max-w-7xl px-4 sm:px-6 lg:block lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FOG Events</h1>
              <p className="mt-2 text-gray-600">Join our community events and grow together</p>
            </div>
            {isAdmin() && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Event
              </button>
            )}
          </div>
        </div>

        <div id="ladies-night-highlight" className="mb-8">
          <div className="overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
              <div
                className="relative h-64 cursor-pointer lg:h-72"
                onClick={() => setShowFullView(true)}
              >
                <img
                  src={ladiesNightPhotos[currentPhotoIndex]}
                  alt="Ladies Night Event"
                  className="pointer-events-none h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <button
                  type="button"
                  onClick={goToPrevPhoto}
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={goToNextPhoto}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
                  {currentPhotoIndex + 1} / {photoCount}
                </span>
              </div>
              <div className="p-6 text-white lg:p-8">
                <span className="mb-2 inline-flex items-center rounded-full bg-white/20 px-2 py-1 text-xs font-medium text-white">
                  Latest Event
                </span>
                <h2 className="mb-2 text-xl font-bold lg:text-2xl">Empowerment night 08 Highlights</h2>
                <p className="mb-4 text-white/90">
                  A special evening celebrating women in faith, featuring worship, fellowship, and
                  empowerment.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 leading-5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">All Events</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
              >
                <div className="relative">
                  <EventImage src={event.image} alt={event.title} variant="card" />
                  <div className="absolute left-3 top-3 z-10">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(event.category)}`}
                    >
                      {categories.find((cat) => cat.id === event.category)?.name}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">{event.title}</h3>
                  <p className="mb-3 line-clamp-2 text-sm text-gray-600">{event.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="mr-1 h-3 w-3" />
                    {event.timeDisplay}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showFullView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" style={{ zIndex: 9999 }}>
          <div className="relative flex h-full w-full items-center justify-center">
            <button
              type="button"
              onClick={() => setShowFullView(false)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={goToPrevPhoto}
              className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              type="button"
              onClick={goToNextPhoto}
              className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label="Next photo"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
            <span className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
              {currentPhotoIndex + 1} / {photoCount}
            </span>
            <img
              src={ladiesNightPhotos[currentPhotoIndex]}
              alt="Ladies Night Event"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      )}

      {showAddModal && null}
    </div>
  );
};

export default Events;
