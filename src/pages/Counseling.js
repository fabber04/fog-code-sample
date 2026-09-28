import React from 'react';
import {
  HeartHandshake,
  MessageCircle,
  Phone,
  Mail,
  Star,
} from 'lucide-react';
import MobilePageHeader from '../components/mobile/MobilePageHeader';
import MobilePageNotificationBell from '../components/notifications/MobilePageNotificationBell';
import MobileListCard from '../components/mobile/MobileListCard';

const Counseling = () => {
  return (
    <div className="min-h-full bg-white lg:min-h-screen lg:bg-gray-50 lg:py-8">
      <MobilePageHeader title="Counseling" icon={HeartHandshake} rightSlot={<MobilePageNotificationBell />} />

      <div className="lg:hidden">
        <div className="border-b border-gray-100 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-4 py-8 text-white">
          <HeartHandshake className="mb-3 h-10 w-10" />
          <h2 className="text-xl font-bold">You&apos;re Not Alone</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/90">
            Connect with Coach Noble for guidance, counselling, and prayer.
          </p>
        </div>
        <div className="space-y-4 px-4 py-6 pb-8">
          <MobileListCard
            title="Coach Noble"
            subtitle="Youth Mentor & Life Coach"
            description="Do not cry alone — our mentor is here to listen, share wisdom, and pray with you."
            actionLabel="Contact"
          />
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
            <div className="mb-3 flex items-center gap-3">
              <Phone className="h-4 w-4 text-[#2563eb]" />
              <span>+263 77 000 0000</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-[#2563eb]" />
              <span className="break-all">counselor@example.com</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto hidden max-w-4xl px-4 sm:px-6 lg:block lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Counseling & Support</h1>
          <p className="mt-2 text-gray-600">Find encouragement, guidance, and support for your journey</p>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-8 mb-8 text-white">
          <div className="text-center">
            <HeartHandshake className="mx-auto h-16 w-16 mb-4" />
            <h2 className="text-2xl font-bold mb-4">You're Not Alone</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Life can be challenging, but remember that God is always with you. 
              Every step you take, every challenge you face, is part of your unique journey of growth and faith.
            </p>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-lg italic">
                "Come to me, all you who are weary and burdened, and I will give you rest." 
                <br />
                <span className="text-sm">- Matthew 11:28</span>
              </p>
            </div>
          </div>
        </div>

        {/* Encouragement Message */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-8">
          <div className="text-center">
            <Star className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">A Message of Hope</h3>
            <div className="max-w-2xl mx-auto text-gray-700">
              <p className="text-lg">
                Do not cry alone, our mentor is there to listen, share wisdom and pray with you!
              </p>
            </div>
          </div>
        </div>

        {/* Contact Coach Noble */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Need More Support?</h3>
            <p className="text-gray-600">Connect with our mentor for personal guidance, counselling and prayer.</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">CN</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Coach Noble</h4>
              <p className="text-gray-600">Youth Mentor and Life Coach</p>
            </div>
            
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
               <div className="flex items-center justify-center p-3 bg-white rounded-lg">
                 <Phone className="w-5 h-5 text-primary-600 mr-2" />
                 <span className="text-sm text-gray-700">Call</span>
               </div>
               <div className="flex items-center justify-center p-3 bg-white rounded-lg">
                 <Mail className="w-5 h-5 text-primary-600 mr-2" />
                 <span className="text-sm text-gray-700">Email</span>
               </div>
               <div className="flex items-center justify-center p-3 bg-white rounded-lg">
                 <MessageCircle className="w-5 h-5 text-primary-600 mr-2" />
                 <span className="text-sm text-gray-700">Message</span>
               </div>
             </div>
             
             {/* Contact Details */}
             <div className="bg-white rounded-lg p-4 mb-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex items-center justify-center p-3 border border-gray-200 rounded-lg">
                   <Phone className="w-5 h-5 text-primary-600 mr-3" />
                   <div className="text-left">
                     <p className="text-sm font-medium text-gray-900">Phone</p>
                     <p className="text-sm text-primary-600">+263 77 000 0000</p>
                   </div>
                 </div>
                 <div className="flex items-center justify-center p-3 border border-gray-200 rounded-lg">
                   <Mail className="w-5 h-5 text-primary-600 mr-3" />
                   <div className="text-left">
                     <p className="text-sm font-medium text-gray-900">Email</p>
                     <p className="text-sm text-primary-600">counselor@example.com</p>
                   </div>
                 </div>
               </div>
             </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Coach Noble is here to listen, encourage, and provide biblical guidance for whatever you're facing.
              </p>
              <button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors">
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Contact Coach Noble
              </button>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Additional Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <h4 className="font-medium text-gray-900 mb-2">Prayer Requests</h4>
              <p className="text-sm text-gray-600 mb-3">Submit your prayer requests and let our community pray for you</p>
              <button className="text-primary-600 text-sm font-medium hover:text-primary-700">
                Submit Prayer Request →
              </button>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <h4 className="font-medium text-gray-900 mb-2">Devotionals</h4>
              <p className="text-sm text-gray-600 mb-3">Daily devotionals to encourage and strengthen your faith</p>
              <button className="text-primary-600 text-sm font-medium hover:text-primary-700">
                Read Devotionals →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Counseling;
