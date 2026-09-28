import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Play, 
  Clock, 
  Users, 
  Star,
  MessageCircle,
  Phone,
  Calendar,
  MapPin,
  BookOpen,
  Video,
  Download,
  Certificate,
  Lock,
  Unlock,
  Eye,
  Heart,
  Share2
} from 'lucide-react';
import MobilePageHeader from '../components/mobile/MobilePageHeader';
import MobilePageNotificationBell from '../components/notifications/MobilePageNotificationBell';
import MobileFilterPill from '../components/mobile/MobileFilterPill';
import MobileListCard from '../components/mobile/MobileListCard';

/** WhatsApp orders: +263 77 000 0001 | Calls: 0770000000 */
const GENIUS_ACADEMY_WHATSAPP = '263781603743';
const GENIUS_ACADEMY_CALL = '0770000000';

const openWhatsAppOrder = (course) => {
  const message = encodeURIComponent(
    `Hi, I would like to order this Genius Academy course:\n\n` +
      `"${course.title}"\n` +
      `Price: $${course.price}\n\n` +
      `Please share how I can complete my enrollment.`
  );
  window.open(`https://wa.me/${GENIUS_ACADEMY_WHATSAPP}?text=${message}`, '_blank', 'noopener,noreferrer');
};

const GeniusAcademy = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showEnrollment, setShowEnrollment] = useState(false);

  // Genius Academy Courses
  const courses = [
    {
      id: 1,
      title: 'Level 01: Relationship Coaching Program',
      instructor: 'Coach Noble Masvingise',
      category: 'relationships',
      level: 'beginner',
      description: 'Join one level 01 Relationship coaching program and learn key foundations and principles that make successful relationships. "Learn before you enter into a relationship." Download our course outline below. Coach Noble Masvingise',
      cover: '/images/genius%20academy/one%20level%20relationship.jpeg',
      duration: '12 weeks',
      sessions: 40,
      mentorshipHours: '40hrs of mentorship',
      students: 0,
      rating: 5.0,
      price: 30,
      originalPrice: null,
      isEnrolled: false,
      startDate: new Date().toISOString().split('T')[0],
      tags: ['relationships', 'coaching', 'foundations', 'principles'],
      bonus: '2 FREE BOOKS!',
      curriculum: [
        'Week 1-3: Foundations of Successful Relationships',
        'Week 4-6: Key Principles for Relationship Success',
        'Week 7-9: Building Strong Foundations',
        'Week 10-12: Practical Application and Mentorship'
      ],
      features: [
        '12 weeks comprehensive program',
        '40hrs of mentorship',
        'Downloadable course outline',
        '2 FREE BOOKS included',
        'Direct mentorship with Coach Noble',
        'Learn before you enter into a relationship'
      ]
    },
    {
      id: 2,
      title: 'Level 02: Learn how to run your relationship in a Godly way!',
      instructor: 'Coach Noble Masvingise',
      category: 'relationships',
      level: 'intermediate',
      description: 'In this course you will learn what to do and what not to do in a relationship. If you are in a relationship, you need this course!!',
      cover: '/images/genius%20academy/level%202.jpeg',
      duration: '16 weeks',
      sessions: 60,
      mentorshipHours: '60hrs of mentorship',
      students: 0,
      rating: 5.0,
      price: 60,
      priceLabel: 'investment',
      originalPrice: null,
      isEnrolled: false,
      startDate: new Date().toISOString().split('T')[0],
      tags: ['relationships', 'godly', 'principles', 'guidance'],
      bonus: '3 FREE BOOKS',
      curriculum: [
        'Week 1-4: Godly Principles for Relationships',
        'Week 5-8: What to Do in Your Relationship',
        'Week 9-12: What NOT to Do in Your Relationship',
        'Week 13-16: Running Your Relationship God\'s Way'
      ],
      features: [
        '16 weeks comprehensive program',
        '60hrs of mentorship',
        'Learn what to do and what not to do',
        '3 FREE BOOKS included',
        'Direct mentorship with Coach Noble',
        'Essential for those in relationships'
      ]
    },
    {
      id: 3,
      title: 'Heal from Heartbreak and Restart with Wisdom',
      instructor: 'Coach Noble Masvingise',
      category: 'relationships',
      level: 'beginner',
      description: 'Learn how to heal from a heartbreak, and restart with wisdom in your next relationship. Come let us show you were you missed it as we help you heal.',
      cover: '/images/genius%20academy/restart.jpeg',
      duration: '4 weeks',
      sessions: 8,
      mentorshipHours: '8 hours',
      students: 0,
      rating: 5.0,
      price: 15,
      originalPrice: null,
      isEnrolled: false,
      startDate: new Date().toISOString().split('T')[0],
      tags: ['healing', 'heartbreak', 'restart', 'wisdom'],
      bonus: '1 FREE BOOK',
      curriculum: [
        'Week 1: Understanding Heartbreak and Healing',
        'Week 2: Identifying Where You Missed It',
        'Week 3: Healing Process and Recovery',
        'Week 4: Restarting with Wisdom'
      ],
      features: [
        '4 weeks focused program',
        '8 hours of mentorship',
        'Learn from past mistakes',
        '1 FREE BOOK included',
        'Direct mentorship with Coach Noble',
        'Heal and restart with wisdom'
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', count: courses.length },
    { id: 'relationships', name: 'Relationships', count: courses.filter(course => course.category === 'relationships').length }
  ];

  const levels = [
    { id: 'all', name: 'All Levels', count: courses.length },
    { id: 'beginner', name: 'Beginner', count: courses.filter(course => course.level === 'beginner').length },
    { id: 'intermediate', name: 'Intermediate', count: courses.filter(course => course.level === 'intermediate').length },
    { id: 'advanced', name: 'Advanced', count: courses.filter(course => course.level === 'advanced').length }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleEnroll = (course) => {
    openWhatsAppOrder(course);
  };

  const handlePhoneCall = () => {
    window.location.href = `tel:${GENIUS_ACADEMY_CALL}`;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'leadership':
        return <GraduationCap className="w-5 h-5" />;
      case 'ministry':
        return <BookOpen className="w-5 h-5" />;
      case 'finance':
        return <Download className="w-5 h-5" />;
      case 'youth':
        return <Users className="w-5 h-5" />;
      case 'spiritual':
        return <Star className="w-5 h-5" />;
      default:
        return <GraduationCap className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'leadership':
        return 'bg-blue-100 text-blue-800';
      case 'ministry':
        return 'bg-green-100 text-green-800';
      case 'finance':
        return 'bg-orange-100 text-orange-800';
      case 'youth':
        return 'bg-purple-100 text-purple-800';
      case 'spiritual':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const mobileCategoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="min-h-full bg-white lg:min-h-screen lg:bg-gray-50 lg:py-8">
      <MobilePageHeader title="Genius Academy" icon={GraduationCap} rightSlot={<MobilePageNotificationBell />} />

      <div className="lg:hidden">
        <MobileFilterPill
          value={filterCategory}
          onChange={setFilterCategory}
          options={mobileCategoryOptions}
          label="Filter courses"
        />
        <div className="px-4 pb-8 pt-6">
          {filteredCourses.map((course) => (
            <MobileListCard
              key={course.id}
              image={course.cover}
              imageAlt={course.title}
              imageClassName="aspect-[4/3] w-full"
              imageFit="cover"
              badge={{ line1: `$${course.price}`, line2: 'Course' }}
              title={course.title}
              subtitle={`${course.duration} · ${course.instructor}`}
              description={course.description}
              actionLabel="Order on WhatsApp"
              onAction={() => handleEnroll(course)}
              onClick={() => handleEnroll(course)}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto hidden max-w-7xl px-4 sm:px-6 lg:block lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Genius Academy</h1>
          <p className="mt-2 text-gray-600">Transform your ministry and leadership skills with expert-led courses</p>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-8 mb-8 text-white">
          <div className="text-center">
            <GraduationCap className="mx-auto h-16 w-16 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Join the Genius Academy</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              We exist to revolutionize Real Love in young people. This is the number one academy for youth relationship coaching hosted by our mentor Coach Noble Masvingise an author of more than 25 books.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={handlePhoneCall}
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-5 h-5 inline mr-2" />
                Call {GENIUS_ACADEMY_CALL}
              </button>
              <a
                href={`https://wa.me/${GENIUS_ACADEMY_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-primary-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5 inline mr-2" />
                Order on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search Genius Academy courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {levels.map(level => (
                <option key={level.id} value={level.id}>
                  {level.name} ({level.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              {/* Cover Image */}
              <div className="relative">
                <img
                  src={course.cover}
                  alt={course.title}
                  className="w-full h-48 object-cover bg-gray-100"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center';
                  }}
                />
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(course.category)}`}>
                    {getCategoryIcon(course.category)}
                    <span className="ml-1 capitalize">{course.category}</span>
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>
                {course.originalPrice && course.originalPrice > course.price && (
                  <div className="absolute bottom-2 left-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                )}
                {course.bonus && (
                  <div className="absolute bottom-2 right-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {course.bonus}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                
                {/* Instructor */}
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Users className="w-4 h-4 mr-2" />
                  {course.instructor}
                </div>

                {/* Course Details */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Video className="w-4 h-4 mr-1" />
                    {course.mentorshipHours || `${course.sessions} sessions`}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    {course.rating}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {course.students} students
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-primary-600">${course.price}</span>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <span className="text-sm text-gray-500 line-through ml-2">${course.originalPrice}</span>
                      )}
                      {course.priceLabel ? (
                        <span className="text-sm font-semibold text-primary-600 ml-2">{course.priceLabel}</span>
                      ) : course.price < 50 && (
                        <span className="text-sm font-semibold text-green-600 ml-2">Only</span>
                      )}
                    </div>
                    {course.bonus && (
                      <span className="text-sm font-semibold text-green-600 mt-1">{course.bonus}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Starts {new Date(course.startDate).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEnroll(course)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Enroll Now
                  </button>
                  
                  <button
                    onClick={() => handlePhoneCall()}
                    className="px-3 py-2 text-sm font-medium text-green-600 border border-green-300 rounded-lg hover:bg-green-50"
                    aria-label="Call to enroll"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Course Details Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-medium text-gray-900">{selectedCourse.title}</h3>
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Cover and Basic Info */}
                  <div>
                    <img
                      src={selectedCourse.cover}
                      alt={selectedCourse.title}
                      className="w-full rounded-lg mb-4 bg-gray-100"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center';
                      }}
                    />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedCourse.category)}`}>
                          {getCategoryIcon(selectedCourse.category)}
                          <span className="ml-2 capitalize">{selectedCourse.category}</span>
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(selectedCourse.level)}`}>
                          {selectedCourse.level}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-2" />
                        {selectedCourse.instructor}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        Starts {new Date(selectedCourse.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        {selectedCourse.duration} • {selectedCourse.mentorshipHours || `${selectedCourse.sessions} sessions`}
                      </div>
                    </div>
                  </div>
                  
                  {/* Details and Enrollment */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">About This Course</h4>
                      <p className="text-gray-600">{selectedCourse.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">What You'll Learn</h4>
                      <ul className="space-y-2">
                        {selectedCourse.curriculum.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-sm text-gray-600">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Course Features</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedCourse.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center">
                            <span className="text-3xl font-bold text-primary-600">${selectedCourse.price}</span>
                            {selectedCourse.originalPrice && selectedCourse.originalPrice > selectedCourse.price && (
                              <span className="text-lg text-gray-500 line-through ml-2">${selectedCourse.originalPrice}</span>
                            )}
                            {selectedCourse.priceLabel ? (
                              <span className="text-sm font-semibold text-primary-600 ml-2">{selectedCourse.priceLabel}</span>
                            ) : selectedCourse.price < 50 && (
                              <span className="text-sm font-semibold text-green-600 ml-2">Only</span>
                            )}
                          </div>
                          {selectedCourse.bonus && (
                            <div className="mt-2">
                              <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">{selectedCourse.bonus}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">{selectedCourse.students} students enrolled</div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            {selectedCourse.rating} rating
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEnroll(selectedCourse)}
                          className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                        >
                          Enroll Now
                        </button>
                        <button
                          type="button"
                          onClick={handlePhoneCall}
                          className="bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                          aria-label="Call to enroll"
                        >
                          <Phone className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enrollment Modal */}
        {showEnrollment && selectedCourse && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="text-center">
                  <GraduationCap className="mx-auto h-12 w-12 text-primary-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Enroll in {selectedCourse.title}</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Ready to transform your skills? Complete your enrollment below.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Course Price:</span>
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-primary-600">${selectedCourse.price}</span>
                          {selectedCourse.price < 50 && (
                            <span className="text-sm font-semibold text-green-600 ml-2">Only</span>
                          )}
                        </div>
                      </div>
                      {selectedCourse.originalPrice && selectedCourse.originalPrice > selectedCourse.price && (
                        <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                          <span>Original Price:</span>
                          <span className="line-through">${selectedCourse.originalPrice}</span>
                        </div>
                      )}
                      {selectedCourse.bonus && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-green-600">Bonus:</span>
                            <span className="text-sm font-semibold text-green-600">{selectedCourse.bonus}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowEnrollment(false)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleEnroll(selectedCourse);
                          setShowEnrollment(false);
                        }}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                      >
                        Enroll via WhatsApp
                      </button>
                    </div>
                    
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handlePhoneCall}
                        className="text-sm text-green-600 hover:text-green-700 flex items-center justify-center mx-auto"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Prefer a call? {GENIUS_ACADEMY_CALL}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeniusAcademy;
