import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  User, 
  BookOpen, 
  Edit3, 
  Save, 
  Trash2, 
  Download,
  Settings,
  Heart,
  Calendar,
  Bookmark,
  FileText,
  Mail,
  Bell,
  Shield,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';


const Profile = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('saved');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    age: null,
    grade: 'College',
    joinDate: new Date().toISOString().split('T')[0],
    avatar: null
  });

  // Load user profile from currentUser, localStorage, or defaults
  useEffect(() => {
    const loadUserProfile = () => {
      let profileData = {
        name: '',
        email: '',
        phone: '',
        age: null,
        grade: 'College',
        joinDate: new Date().toISOString().split('T')[0],
        avatar: null
      };

      // Priority 1: Use current logged-in user from AuthContext
      if (currentUser) {
        profileData = {
          name: currentUser.name || currentUser.displayName || currentUser.email || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          age: currentUser.age || null,
          grade: currentUser.grade || 'College',
          joinDate: currentUser.joinDate || currentUser.createdAt || new Date().toISOString().split('T')[0],
          avatar: currentUser.avatar || null
        };
      }

      // Priority 2: Try localStorage (for saved profile customizations like avatar)
      // Only use localStorage if it matches the current user
      try {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          const saved = JSON.parse(savedProfile);
          // Only merge if it's for the same user (check email match)
          if (!currentUser || saved.email === currentUser.email) {
            // Merge saved profile with current user data (saved takes precedence for customizations)
            profileData = {
              ...profileData,
              ...saved,
              // But always keep current user's email and name if they exist
              email: currentUser?.email || saved.email || profileData.email,
              name: currentUser?.name || currentUser?.displayName || saved.name || profileData.name,
            };
          } else {
            // Different user - clear old localStorage data
            localStorage.removeItem('userProfile');
          }
        }
      } catch (error) {
        console.error('Error loading saved profile:', error);
        // Clear corrupted localStorage data
        localStorage.removeItem('userProfile');
      }

      // Priority 3: If still no data, use demo defaults only in demo mode
      if (!profileData.name && !profileData.email) {
        // Only use demo defaults if we're truly in demo mode (no currentUser at all)
        if (!currentUser) {
          profileData = {
            name: 'Demo User',
            email: 'demo@fog.com',
            phone: '',
            age: null,
            grade: 'College',
            joinDate: new Date().toISOString().split('T')[0],
            avatar: null
          };
        }
      }

      setUserProfile(profileData);
    };

    loadUserProfile();
  }, [currentUser]);

  // Mock saved devotionals
  const savedDevotionals = [
    {
      id: 1,
      title: "Walking in Faith",
      scripture: "Hebrews 11:1-6",
      author: "Pastor Sarah",
      date: "2024-01-14",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "God's Love Never Fails",
      scripture: "1 Corinthians 13:4-8",
      author: "Pastor Mike",
      date: "2024-01-08",
      readTime: "8 min read"
    },
    {
      id: 3,
      title: "Finding Peace in Chaos",
      scripture: "Philippians 4:6-7",
      author: "Youth Leader Lisa",
      date: "2024-01-01",
      readTime: "6 min read"
    }
  ];

  // Mock journal entries
  const journalEntries = [
    {
      id: 1,
      title: "Reflection on Today's Devotional",
      content: "Today's message about faith really spoke to me. I realized that I need to trust God more in my daily decisions...",
      date: "2024-01-14",
      wordCount: 156
    },
    {
      id: 2,
      title: "Prayer Journal Entry",
      content: "Lord, thank you for this beautiful day. I pray for strength to face the challenges ahead...",
      date: "2024-01-12",
      wordCount: 89
    },
    {
      id: 3,
      title: "Bible Study Notes",
      content: "Romans 8:28 - All things work together for good for those who love God. This verse gives me hope...",
      date: "2024-01-10",
      wordCount: 203
    }
  ];

  // Mock prayer requests
  const myPrayerRequests = [
    {
      id: 1,
      title: "Prayer for my family",
      date: "2024-01-14",
      prayerCount: 8,
      isAnswered: false
    },
    {
      id: 2,
      title: "Guidance for college decision",
      date: "2024-01-13",
      prayerCount: 12,
      isAnswered: false
    }
  ];

  const handleSaveProfile = () => {
    try {
      // Save to localStorage (only for customizations like avatar, phone, grade)
      // Always include current user's email to match on next load
      const profileToSave = {
        ...userProfile,
        email: currentUser?.email || userProfile.email, // Always use current user's email
        name: currentUser?.name || currentUser?.displayName || userProfile.name, // Always use current user's name
      };
      localStorage.setItem('userProfile', JSON.stringify(profileToSave));
      
      setIsEditing(false);
      setIsSaved(true);
      toast.success('Profile updated successfully!');
      
      // Reset the saved indicator after 2 seconds
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  const handleExportJournal = (entryId) => {
    const entry = journalEntries.find(e => e.id === entryId);
    if (entry) {
      // In a real app, this would generate and download a PDF
      toast.success(`Journal entry "${entry.title}" exported!`);
    }
  };

  const handleDeleteJournal = (entryId) => {
    // In a real app, this would remove from database
    toast.success('Journal entry deleted!');
  };

  const handleRemoveDevotional = (devotionalId) => {
    // In a real app, this would remove from saved list
    toast.success('Devotional removed from saved list!');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const avatarUrl = reader.result;
        const updatedProfile = { ...userProfile, avatar: avatarUrl };
        setUserProfile(updatedProfile);
        
        // Save to localStorage immediately
        try {
          localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
          toast.success('Profile picture updated!');
        } catch (error) {
          console.error('Error saving profile:', error);
          toast.error('Failed to save profile picture');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and view your activity</p>
        </div>
        {currentUser && (
          <button 
            className="btn-outline flex items-center"
            onClick={() => {
              // Logout is handled by Layout component
              window.location.href = '/#/login';
            }}
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className={`card ${isSaved ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center overflow-hidden">
                  {userProfile.avatar ? (
                    <img 
                      src={userProfile.avatar} 
                      alt={userProfile.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {getInitials(userProfile.name)}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors shadow-lg">
                  <Edit3 size={14} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{userProfile.name}</h2>
              <p className="text-gray-600 mb-4">{userProfile.grade}</p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <Mail size={14} className="mr-2" />
                  {userProfile.email}
                </div>
                <div className="flex items-center justify-center">
                  <Calendar size={14} className="mr-2" />
                  Member since {formatDate(userProfile.joinDate)}
                </div>
              </div>

              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  if (!isEditing) {
                    setActiveTab('settings');
                    // Scroll to the settings section after a brief delay to ensure it's rendered
                    setTimeout(() => {
                      const settingsSection = document.getElementById('settings-section');
                      if (settingsSection) {
                        settingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }
                }}
                className={`mt-4 flex items-center mx-auto ${
                  isEditing 
                    ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
                    : 'btn-outline'
                }`}
              >
                <Edit3 size={16} className="mr-2" />
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bookmark size={16} className="text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Saved Devotionals</span>
                </div>
                <span className="font-semibold text-gray-900">{savedDevotionals.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText size={16} className="text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Journal Entries</span>
                </div>
                <span className="font-semibold text-gray-900">{journalEntries.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Heart size={16} className="text-red-500 mr-2" />
                  <span className="text-sm text-gray-600">Prayer Requests</span>
                </div>
                <span className="font-semibold text-gray-900">{myPrayerRequests.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'saved', name: 'Saved Devotionals', icon: Bookmark },
                { id: 'journal', name: 'Journal Entries', icon: FileText },
                { id: 'prayers', name: 'My Prayers', icon: Heart },
                { id: 'settings', name: 'Settings', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} className="mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Saved Devotionals Tab */}
          {activeTab === 'saved' && (
            <div className="space-y-4">
              {savedDevotionals.map((devotional) => (
                <div key={devotional.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{devotional.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{devotional.scripture}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>By {devotional.author}</span>
                        <span>•</span>
                        <span>{formatDate(devotional.date)}</span>
                        <span>•</span>
                        <span>{devotional.readTime}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveDevotional(devotional.id)}
                      className="p-2 text-gray-400 hover:text-red-500 ml-4"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Journal Entries Tab */}
          {activeTab === 'journal' && (
            <div className="space-y-4">
              {journalEntries.map((entry) => (
                <div key={entry.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{entry.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{formatDate(entry.date)} • {entry.wordCount} words</p>
                      <p className="text-gray-700 line-clamp-3">{entry.content}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleExportJournal(entry.id)}
                        className="p-2 text-gray-400 hover:text-blue-500"
                        title="Export"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteJournal(entry.id)}
                        className="p-2 text-gray-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* My Prayers Tab */}
          {activeTab === 'prayers' && (
            <div className="space-y-4">
              {myPrayerRequests.map((request) => (
                <div key={request.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{request.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatDate(request.date)}</span>
                        <span>•</span>
                        <span>{request.prayerCount} people praying</span>
                        {request.isAnswered && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-medium">Answered</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div id="settings-section" className="space-y-6">
              {/* Profile Settings */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Profile Information</h3>
                <div className="space-y-4">
                  {/* Profile Picture Upload */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center overflow-hidden">
                        {userProfile.avatar ? (
                          <img 
                            src={userProfile.avatar} 
                            alt={userProfile.name}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-xl font-bold">
                            {getInitials(userProfile.name)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Picture
                      </label>
                      <label className="btn-outline inline-flex items-center cursor-pointer">
                        <Edit3 size={16} className="mr-2" />
                        {userProfile.avatar ? 'Change Picture' : 'Upload Picture'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size 5MB</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                        disabled={!isEditing}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={userProfile.email}
                        onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                        disabled={!isEditing}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={userProfile.phone}
                        onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                        disabled={!isEditing}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade
                      </label>
                      <select
                        value={userProfile.grade}
                        onChange={(e) => setUserProfile({...userProfile, grade: e.target.value})}
                        disabled={!isEditing}
                        className="input-field"
                      >
                        <option>9th Grade</option>
                        <option>10th Grade</option>
                        <option>11th Grade</option>
                        <option>12th Grade</option>
                        <option>College</option>
                      </select>
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveProfile}
                        className="btn-primary flex items-center"
                      >
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Notification Settings */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bell size={16} className="text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Event Reminders</p>
                        <p className="text-sm text-gray-600">Get notified about upcoming events</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOpen size={16} className="text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Daily Devotional</p>
                        <p className="text-sm text-gray-600">Receive daily devotional notifications</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart size={16} className="text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Prayer Updates</p>
                        <p className="text-sm text-gray-600">Get notified when someone prays for you</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Privacy & Security</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield size={16} className="text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Profile Visibility</p>
                        <p className="text-sm text-gray-600">Control who can see your profile</p>
                      </div>
                    </div>
                    <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                      <option>Youth Group Only</option>
                      <option>Church Members</option>
                      <option>Public</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 