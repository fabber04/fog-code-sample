import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  BookOpen, 
  ArrowRight,
  Library,
  Headphones,
  GraduationCap,
  HeartHandshake
} from 'lucide-react';
import { EVENT_IMAGES } from '../constants/eventImages';
import EventImage from '../components/EventImage';


const Dashboard = () => {

  const latestDevotional = {
    title: 'Our theme scripture',
    scripture: 'Psalm 71:21',
    verse: 'Thou shalt increase my greatness, and comfort me on every side.',
    author: 'Pastor Tafadzwa Moyo',
    date: '2024-01-14',
    readTime: '5 min read',
  };

  const quickActions = [
    { name: "Library", href: "/library", icon: Library, color: "bg-accent-500" },
    { name: "Podcasts", href: "/podcasts", icon: Headphones, color: "bg-secondary-500" },
    { name: "Events", href: "/events", icon: Calendar, color: "bg-green-600" },
    { name: "Genius Academy", href: "/masterclass", icon: GraduationCap, color: "bg-primary-800" },
    { name: "Counseling", href: "/counseling", icon: HeartHandshake, color: "bg-secondary-600" },
    { name: "Relationship Devotionals", href: "/devotionals", icon: BookOpen, color: "bg-accent-600" }
  ];

  return (
    <div className="space-y-6 lg:space-y-10 xl:space-y-12 2xl:space-y-16">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5c2448] via-[#663052] to-[#7a3848] p-6 text-center text-white hover-lift min-h-[220px] lg:min-h-[270px] lg:rounded-[2rem] lg:p-10 xl:min-h-[320px] xl:rounded-[2.5rem] xl:p-12 2xl:p-16">
        <div className="absolute inset-0 opacity-[0.28]">
          <img src="/images/meet%20our%20mentor.jpeg" alt="Meet Our Mentor" className="h-full w-full object-cover object-[50%_22%]" />
        </div>
        <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-center lg:min-h-[270px] xl:min-h-[320px]">
          <h1 className="text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-4 text-shadow">
            WELCOME TO FAMILY OF GREATNESS
          </h1>
          <div className="mx-auto mb-6 max-w-3xl space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-200/95 lg:text-xs">
              Our Vision
            </p>
            <p className="text-lg font-medium leading-snug text-white/95 sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl">
              Raising{' '}
              <span className="font-bold text-white">Great People</span>
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> </span>
              for{' '}
              <span className="bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 bg-clip-text font-bold text-transparent">
                Global Impact
              </span>
            </p>
            <div className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent" aria-hidden />
          </div>
          <div className="flex justify-center">
            <Link
              to="/events"
              className="bg-white text-primary-600 px-8 py-3 rounded-full font-semibold hover:bg-accent-50 hover:scale-105 transition-all duration-200 hover-lift"
            >
              Explore Ministries
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2">Quick Access</h2>
          <p className="text-gray-600 text-lg">Explore our ministries and resources</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 lg:gap-6 xl:gap-8">
          {quickActions.map((action) => (
            action.href ? (
              <Link
                key={action.name}
                to={action.href}
                className="group relative min-h-[148px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-gray-200 hover:shadow-xl sm:min-h-[160px] lg:min-h-[180px] lg:p-8 xl:min-h-[200px] xl:p-10"
              >
                <div className="text-center">
                  <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 lg:h-20 lg:w-20 xl:h-24 xl:w-24 ${action.color}`}>
                    <action.icon size={28} className="text-white lg:h-8 lg:w-8 xl:h-10 xl:w-10" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm lg:text-base xl:text-lg leading-tight group-hover:text-primary-600 transition-colors duration-200">
                    {action.name}
                  </h3>
                </div>
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-50/0 to-primary-50/0 group-hover:from-primary-50/20 group-hover:to-primary-50/0 rounded-2xl transition-all duration-300"></div>
              </Link>
            ) : (
              <button
                key={action.name}
                onClick={action.action}
                className="group relative min-h-[148px] w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-gray-200 hover:shadow-xl sm:min-h-[160px] lg:min-h-[180px] lg:p-8 xl:min-h-[200px] xl:p-10"
              >
                <div className="text-center">
                  <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 lg:h-20 lg:w-20 xl:h-24 xl:w-24 ${action.color}`}>
                    <action.icon size={28} className="text-white lg:h-8 lg:w-8 xl:h-10 xl:w-10" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm lg:text-base xl:text-lg leading-tight group-hover:text-primary-600 transition-colors duration-200">
                    {action.name}
                  </h3>
                </div>
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-50/0 to-primary-50/0 group-hover:from-primary-50/20 group-hover:to-primary-50/0 rounded-2xl transition-all duration-300"></div>
              </button>
            )
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div className="card">
        <h2 className="text-xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-semibold mb-6 text-center">Our Services & Events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Morning Prayers */}
          <div className="text-center bg-blue-50 rounded-xl hover:shadow-md transition-shadow overflow-hidden">
            <EventImage src={EVENT_IMAGES.morningPrayers} alt="Morning Prayers" variant="dashboard" />
            <div className="p-5">
              <h3 className="font-semibold text-lg mb-2">Morning Prayers</h3>
              <p className="text-gray-600">Every Monday, Wednesday, Friday</p>
              <p className="text-gray-500 text-sm">Time: 0400hrs</p>
            </div>
          </div>

          {/* Weekly Services */}
          <div className="text-center bg-purple-50 rounded-xl hover:shadow-md transition-shadow overflow-hidden">
            <EventImage src={EVENT_IMAGES.weeklyServices} alt="Weekly Services" variant="dashboard" />
            <div className="p-5">
              <h3 className="font-semibold text-lg mb-2">Weekly Services</h3>
              <p className="text-gray-600">Every Wednesday (Online)</p>
            </div>
          </div>

          {/* Relationship Thursday */}
          <div className="text-center bg-pink-50 rounded-xl hover:shadow-md transition-shadow overflow-hidden">
            <EventImage src={EVENT_IMAGES.relationshipThursday} alt="Relationship Thursday" variant="dashboard" />
            <div className="p-5">
              <h3 className="font-semibold text-lg mb-2">Relationship Thursday</h3>
              <p className="text-gray-600">Every Thursday - 2000Hrs CAT</p>
              <p className="text-gray-500 text-sm">Live on YouTube</p>
            </div>
          </div>

          {/* Empowerment Nights */}
          <div className="text-center bg-orange-50 rounded-xl hover:shadow-md transition-shadow overflow-hidden">
            <EventImage src={EVENT_IMAGES.empowermentNights} alt="Empowerment Nights" variant="dashboard" />
            <div className="p-5">
              <h3 className="font-semibold text-lg mb-2">Empowerment Nights</h3>
              <p className="text-gray-600">Hosted twice every year</p>
              <p className="text-gray-500 text-sm">(Dates to be announced)</p>
            </div>
          </div>

          {/* Social Dinner */}
          <div className="text-center bg-green-50 rounded-xl hover:shadow-md transition-shadow overflow-hidden">
            <EventImage src={EVENT_IMAGES.socialDinner} alt="Social Dinner" variant="dashboard" />
            <div className="p-5">
              <h3 className="font-semibold text-lg mb-2">Social Dinner</h3>
              <p className="text-gray-600">Hosted once every year</p>
              <p className="text-gray-500 text-sm">(Dates to be announced)</p>
            </div>
          </div>

          {/* Wisdom Class */}
          <div className="text-center bg-indigo-50 rounded-xl hover:shadow-md transition-shadow overflow-hidden">
            <EventImage src={EVENT_IMAGES.wisdomClass} alt="Wisdom Class" variant="dashboard" />
            <div className="p-5">
              <h3 className="font-semibold text-lg mb-2">Wisdom Class</h3>
              <p className="text-gray-600">Hosted once every month</p>
              <p className="text-gray-500 text-sm">(Dates to be announced)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 2xl:grid-cols-1 gap-6 lg:gap-8 xl:gap-10 2xl:gap-12">
        {/* Events section removed */}

        {/* Right sidebar content */}
        <div className="lg:col-span-1 xl:col-span-1 2xl:col-span-1 space-y-6 lg:space-y-8 xl:space-y-10">
          {/* Latest Devotional */}
          <div className="card">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-lg lg:text-2xl xl:text-3xl 2xl:text-4xl font-semibold text-gray-900">Latest Devotional</h2>
              <Link to="/devotionals" className="text-primary-600 hover:text-primary-700 text-sm lg:text-base font-medium">
                <BookOpen size={16} className="lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
              </Link>
            </div>
            <div className="space-y-3 lg:space-y-4 xl:space-y-5">
              <h3 className="font-semibold text-gray-900 text-base lg:text-xl xl:text-2xl">{latestDevotional.title}</h3>
              <p className="text-sm lg:text-base xl:text-lg text-gray-600 italic">"{latestDevotional.verse}"</p>
              <p className="text-xs lg:text-sm xl:text-base text-gray-500">
                {latestDevotional.scripture} • {latestDevotional.readTime}
              </p>
              <div className="pt-2 lg:pt-3 xl:pt-4">
                <Link 
                  to="/devotionals" 
                  className="inline-flex items-center text-sm lg:text-base xl:text-lg font-medium text-primary-600 hover:text-primary-700"
                >
                  Read full devotional
                  <ArrowRight size={16} className="ml-1 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
                </Link>
              </div>
            </div>
          </div>


        </div>
      </div>

    </div>
  );
};

export default Dashboard; 