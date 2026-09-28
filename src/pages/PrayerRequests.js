import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Heart, 
  Plus, 
  MessageCircle, 
  User, 
  Eye, 
  EyeOff, 
  Send,
  Filter,
  Search,
  Calendar,
  Users,
  CheckCircle,
  X,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import MobilePageHeader from '../components/mobile/MobilePageHeader';
import MobilePageNotificationBell from '../components/notifications/MobilePageNotificationBell';
import MobileFilterPill from '../components/mobile/MobileFilterPill';
import MobileListCard from '../components/mobile/MobileListCard';

const PrayerRequests = () => {
  const { isAdmin } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    isAnonymous: false,
    name: ''
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showComments, setShowComments] = useState({});

  // Mock prayer requests data
  const [prayerRequests, setPrayerRequests] = useState([
    {
      id: 1,
      title: "Prayer for my family",
      description: "My family is going through a difficult time. Please pray for strength and guidance during this season.",
      author: "Sarah M.",
      isAnonymous: false,
      date: "2025-01-14T10:30:00",
      prayerCount: 8,
      comments: [
        {
          id: 1,
          author: "Youth Leader Learmy",
          content: "Praying for you and your family. God is faithful!",
          date: "2025-01-14T11:00:00"
        },
        {
          id: 2,
          author: "Anonymous",
          content: "I'm praying for strength and peace for your family.",
          date: "2025-01-14T12:15:00"
        },
        {
          id: 3,
          author: "Simba Chikwetu",
          content: "Zvinoita Sarah stay strong , we are praying for you",
          date: "2025-01-14T12:00:00"
        }
      ],
      isAnswered: false
    },
    {
      id: 2,
      title: "Guidance for college decision",
      description: "I'm trying to decide which college to attend. Please pray for wisdom and clarity in making this important decision.",
      author: "Anonymous",
      isAnonymous: true,
      date: "2025-01-13T15:45:00",
      prayerCount: 12,
      comments: [
        {
          id: 3,
          author: "Tammary",
          content: "Praying that God will guide you to the right path. Trust in His plan!",
          date: "2025-01-13T16:30:00"
        }
      ],
      isAnswered: false
    },
    {
      id: 3,
      title: "Healing for my grandmother",
      description: "My grandmother is in the hospital. Please pray for her recovery and for peace for our family.",
      author: "David K.",
      isAnonymous: false,
      date: "2025-01-12T09:20:00",
      prayerCount: 15,
      comments: [
         {
        id: 4,
        author: "Anonymous",
        content: "Praying for your grandmother! God is faithful!",
        date: "2025-01-12T10:00:00"
      },
      {
        id: 5,
        author: "Sean",
        content: "Mwari ngaavaporese. Amen",
        date: "2025-01-12T10:00:00"
      }
    ],
      isAnswered: true,
      
    },
    {
      id: 4,
      title: "Prayer for our youth group",
      description: "Please pray for unity and growth in our youth group. We want to serve God together and reach others for Christ.",
      author: "Youth Leader Learny",
      isAnonymous: false,
      date: "2025-01-11T14:00:00",
      prayerCount: 20,
      comments: [
        {
          id: 4,
          author: "Anonymous",
          content: "Praying for your youth group! God is doing great things through you.",
          date: "2025-01-11T15:00:00"
        }
      ],
      isAnswered: false
    }
  ]);

  const [newComment, setNewComment] = useState('');

  const filters = [
    { id: 'all', name: 'All Requests', color: 'bg-gray-500' },
    { id: 'active', name: 'Active', color: 'bg-blue-500' },
    { id: 'answered', name: 'Answered', color: 'bg-green-500' },
    { id: 'anonymous', name: 'Anonymous', color: 'bg-purple-500' }
  ];

  const filteredRequests = prayerRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'active' && !request.isAnswered) ||
                         (selectedFilter === 'answered' && request.isAnswered) ||
                         (selectedFilter === 'anonymous' && request.isAnonymous);
    return matchesSearch && matchesFilter;
  });

  const handleAddRequest = () => {
    if (!newRequest.title.trim() || !newRequest.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!newRequest.isAnonymous && !newRequest.name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    const request = {
      id: Date.now(),
      title: newRequest.title,
      description: newRequest.description,
      author: newRequest.isAnonymous ? 'Anonymous' : newRequest.name,
      isAnonymous: newRequest.isAnonymous,
      date: new Date().toISOString(),
      prayerCount: 0,
      comments: [],
      isAnswered: false
    };

    setPrayerRequests([request, ...prayerRequests]);
    setNewRequest({ title: '', description: '', isAnonymous: false, name: '' });
    setShowAddModal(false);
    toast.success('Prayer request sent to admin! We will pray for you.');
  };

  const handlePray = (requestId) => {
    setPrayerRequests(requests =>
      requests.map(request =>
        request.id === requestId
          ? { ...request, prayerCount: request.prayerCount + 1 }
          : request
      )
    );
    toast.success('Prayer counted! 🙏');
  };

  const handleAddComment = (requestId) => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    const comment = {
      id: Date.now(),
      author: 'You',
      content: newComment,
      date: new Date().toISOString()
    };

    setPrayerRequests(requests =>
      requests.map(request =>
        request.id === requestId
          ? { ...request, comments: [...request.comments, comment] }
          : request
      )
    );

    setNewComment('');
    toast.success('Comment added!');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getFilterColor = (filterId) => {
    const filter = filters.find(f => f.id === filterId);
    return filter ? filter.color : 'bg-gray-500';
  };

  const mobileFilterOptions = filters.map((f) => ({ id: f.id, name: f.name }));

  return (
    <div className="min-h-full bg-white lg:min-h-0 lg:bg-transparent">
      <MobilePageHeader title="Prayer Requests" icon={Heart} rightSlot={<MobilePageNotificationBell />} />

      <div className="lg:hidden">
        <MobileFilterPill
          value={selectedFilter}
          onChange={setSelectedFilter}
          options={mobileFilterOptions}
          label="Filter prayer requests"
        />
        <div className="space-y-2 px-4 pb-8 pt-4">
          {!isAdmin() && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mb-4 w-full rounded-full bg-[#2563eb] py-3 text-sm font-semibold text-white"
            >
              Submit Prayer Request
            </button>
          )}
          {filteredRequests.map((request) => (
            <MobileListCard
              key={request.id}
              title={request.title}
              subtitle={`${request.prayerCount} prayers · ${formatDate(request.date)}`}
              description={request.description}
              actionLabel="View"
              onAction={() => setSelectedRequest(request)}
            />
          ))}
        </div>
      </div>

      <div className="hidden space-y-6 lg:block">
      <div className="flex items-center justify-between">
        <div>
                  <h1 className="text-3xl font-bold text-gray-900">Prayer Requests</h1>
        <p className="text-gray-600 mt-1">Submit prayer requests directly to admin for confidential prayer support</p>
        </div>
        {!isAdmin() && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Submit Prayer Request
          </button>
        )}
      </div>

      {/* Admin View - Prayer Requests Management */}
      {isAdmin() ? (
        <>
          {/* Search and Filters */}
          <div className="card">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search prayer requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {filters.map((filter) => (
                    <option key={filter.id} value={filter.id}>
                      {filter.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === filter.id
                    ? `${filter.color} text-white`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>

          {/* Prayer Requests List */}
          <div className="space-y-4">
            {filteredRequests.map((request) => (
          <div key={request.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {request.isAnonymous ? (
                  <User size={16} className="text-gray-400" />
                ) : (
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {request.author.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {request.isAnonymous ? 'Anonymous' : request.author}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(request.date)}</p>
                </div>
              </div>
              {request.isAnswered && (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle size={16} className="mr-1" />
                  Answered
                </div>
              )}
            </div>

            <h3 className="font-semibold text-gray-900 text-lg mb-2">{request.title}</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">{request.description}</p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handlePray(request.id)}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium"
                >
                  <Heart size={16} />
                  <span>I prayed ({request.prayerCount})</span>
                </button>
                <button
                  onClick={() => setShowComments({
                    ...showComments,
                    [request.id]: !showComments[request.id]
                  })}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
                >
                  <MessageCircle size={16} />
                  <span>Comments ({request.comments.length})</span>
                </button>
              </div>
            </div>

            {/* Comments Section */}
            {showComments[request.id] && (
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-3 mb-4">
                  {request.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 text-sm">
                          {comment.author}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(comment.date)}
                        </p>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add an encouraging comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(request.id)}
                  />
                  <button
                    onClick={() => handleAddComment(request.id)}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
        </>
      ) : (
        // User View - Submit Prayer Request Only
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Submit Your Prayer Request</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Your prayer request will be sent directly to our admin team for confidential prayer support. 
            We believe in the power of prayer and will lift your needs before God.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center mx-auto"
          >
            <Plus size={16} className="mr-2" />
            Submit Prayer Request
          </button>
        </div>
      )}

      {/* Add Prayer Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Submit Prayer Request to Admin</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                  placeholder="Brief title for your prayer request"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                  placeholder="Share your prayer need..."
                  rows={4}
                  className="input-field resize-none"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={newRequest.isAnonymous}
                  onChange={(e) => setNewRequest({...newRequest, isAnonymous: e.target.checked})}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-700">
                  Make this request anonymous
                </label>
              </div>

              {!newRequest.isAnonymous && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={newRequest.name}
                    onChange={(e) => setNewRequest({...newRequest, name: e.target.value})}
                    placeholder="Enter your name"
                    className="input-field"
                  />
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRequest}
                  className="btn-primary"
                >
                  Add Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default PrayerRequests; 