import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Eye,
  X,
  Save,
  Upload,
  Loader2,
  Edit,
  Trash2
} from 'lucide-react';
import { eventService } from '../../services/apiService';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (typeof window !== 'undefined' && 
   (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://api.example.com');

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [previewEvent, setPreviewEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'prayer',
    date: '',
    time: '',
    location: '',
    max_attendees: '',
    featured: false,
    image: null
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null
      };

      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, eventData);
        toast.success('Event updated successfully!');
      } else {
        await eventService.createEvent(eventData);
        toast.success('Event created successfully!');
      }

      setShowForm(false);
      resetForm();
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error.message || 'Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'prayer',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      time: event.time || '',
      location: event.location || '',
      max_attendees: event.max_attendees || '',
      featured: event.featured || false,
      image: event.image || null
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventService.deleteEvent(eventId);
      toast.success('Event deleted successfully!');
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handlePreview = (event) => {
    setPreviewEvent(event);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'prayer',
      date: '',
      time: '',
      location: '',
      max_attendees: '',
      featured: false,
      image: null
    });
    setEditingEvent(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await eventService.uploadEventImage(file);
      setFormData({ ...formData, image: result.filename });
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  const categories = ['prayer', 'service', 'devotional', 'empowerment', 'social', 'wisdom'];

  if (loading) {
    return (
      <AdminLayout title="Events" subtitle="Manage events">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Events" subtitle="Manage events">
    <div className="max-w-7xl mx-auto">
        {/* Header with Add Button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
            <p className="mt-1 text-sm text-gray-600">
              {events.length} {events.length === 1 ? 'event' : 'events'} uploaded
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Event
          </button>
        </div>

        {/* Uploaded Content - Events List */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {event.image && (
                  <img
                    src={`${API_BASE_URL}/uploads/events/${event.image}`}
                    alt={event.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-2 flex-1">{event.title}</h3>
                    {event.featured && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded ml-2 flex-shrink-0">Featured</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{event.description}</p>
                  <div className="text-xs text-gray-500 mb-3">
                    <div>{new Date(event.date).toLocaleDateString()}</div>
                    {event.time && <div>{event.time}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="flex-1 flex items-center justify-center px-2 py-1.5 text-xs bg-primary-50 text-primary-600 rounded hover:bg-primary-100"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="px-2 py-1.5 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events uploaded yet</h3>
            <p className="text-sm text-gray-500 mb-6">Get started by uploading your first event</p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Event
            </button>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingEvent ? 'Edit Event' : 'Upload Event'}</h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {categories.filter(c => c !== 'all').map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees</label>
                    <input
                      type="number"
                      value={formData.max_attendees}
                      onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">Feature this event</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Event
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold">Event Preview</h2>
                <button
                  onClick={() => setPreviewEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                {previewEvent.image && (
                  <img
                    src={`http://localhost:8000/uploads/events/${previewEvent.image}`}
                    alt={previewEvent.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{previewEvent.title}</h3>
                <p className="text-gray-600 mb-4">{previewEvent.description}</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div><strong>Category:</strong> {previewEvent.category}</div>
                  <div><strong>Date:</strong> {new Date(previewEvent.date).toLocaleDateString()}</div>
                  {previewEvent.time && <div><strong>Time:</strong> {previewEvent.time}</div>}
                  {previewEvent.location && <div><strong>Location:</strong> {previewEvent.location}</div>}
                  {previewEvent.max_attendees && <div><strong>Max Attendees:</strong> {previewEvent.max_attendees}</div>}
                  {previewEvent.featured && <div><strong>Featured:</strong> Yes</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;
