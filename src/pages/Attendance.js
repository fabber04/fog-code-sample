import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Download, 
  Filter, 
  Search,
  QrCode,
  CheckCircle,
  Clock,
  MapPin,
  BarChart3,
  FileText
} from 'lucide-react';
import { qrService } from '../services/qrService';
import { eventService } from '../services/apiService';
import QRGenerator from '../components/QRGenerator';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadEventCheckIns(selectedEvent.id);
    }
  }, [selectedEvent]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const eventsData = await eventService.getEvents();
      setEvents(eventsData);
      if (eventsData.length > 0) {
        setSelectedEvent(eventsData[0]);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEventCheckIns = async (eventId) => {
    try {
      const checkInsData = await qrService.getEventCheckIns(eventId);
      setCheckIns(checkInsData);
    } catch (error) {
      console.error('Error loading check-ins:', error);
      toast.error('Failed to load check-in data');
    }
  };

  const filteredCheckIns = checkIns.filter(checkIn => {
    const matchesSearch = checkIn.userProfile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         checkIn.userProfile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || checkIn.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const generateQRCode = (event) => {
    setSelectedEvent(event);
    setShowQRGenerator(true);
  };

  const exportAttendanceData = () => {
    if (!selectedEvent || checkIns.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csvData = [
      ['Name', 'Email', 'Phone', 'Check-in Time', 'Status'],
      ...filteredCheckIns.map(checkIn => [
        checkIn.userProfile?.name || 'Anonymous',
        checkIn.userProfile?.email || '',
        checkIn.userProfile?.phone || '',
        checkIn.checkInTime ? new Date(checkIn.checkInTime.toDate()).toLocaleString() : 'N/A',
        checkIn.status
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${selectedEvent.title.replace(/\s+/g, '-').toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('Attendance data exported!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCheckInTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getAttendanceStats = () => {
    const totalCheckIns = checkIns.length;
    const todayCheckIns = checkIns.filter(checkIn => {
      const checkInDate = checkIn.checkInTime?.toDate ? checkIn.checkInTime.toDate() : new Date(checkIn.checkInTime);
      const today = new Date();
      return checkInDate.toDateString() === today.toDateString();
    }).length;

    return {
      total: totalCheckIns,
      today: todayCheckIns,
      percentage: selectedEvent?.maxAttendees ? Math.round((totalCheckIns / selectedEvent.maxAttendees) * 100) : 0
    };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor and manage event check-ins</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportAttendanceData}
            disabled={!selectedEvent || checkIns.length === 0}
            className="btn-outline flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Event Selection */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Select Event</h2>
          {selectedEvent && (
            <button
              onClick={() => generateQRCode(selectedEvent)}
              className="btn-primary flex items-center"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                selectedEvent?.id === event.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(event.date)}
                </p>
                <p className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(event.time)}
                </p>
                <p className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {event.location}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Stats */}
      {selectedEvent && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Check-ins</div>
          </div>
          
          <div className="card text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.today}</div>
            <div className="text-sm text-gray-600">Today's Check-ins</div>
          </div>
          
          <div className="card text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.percentage}%</div>
            <div className="text-sm text-gray-600">Attendance Rate</div>
          </div>
        </div>
      )}

      {/* Check-ins List */}
      {selectedEvent && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Check-ins for {selectedEvent.title}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search attendees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="checked-in">Checked In</option>
                <option value="late">Late</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading check-in data...</p>
            </div>
          ) : filteredCheckIns.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No check-ins found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Check-in Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCheckIns.map((checkIn) => (
                    <tr key={checkIn.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-medium text-sm">
                              {checkIn.userProfile?.name?.charAt(0) || 'A'}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {checkIn.userProfile?.name || 'Anonymous'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {checkIn.userProfile?.email || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatCheckInTime(checkIn.checkInTime)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          checkIn.status === 'checked-in'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {checkIn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* QR Generator Modal */}
      {showQRGenerator && selectedEvent && (
        <QRGenerator
          event={selectedEvent}
          onClose={() => setShowQRGenerator(false)}
        />
      )}
    </div>
  );
};

export default Attendance; 