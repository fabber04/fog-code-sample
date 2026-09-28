import React, { useState, useEffect } from 'react';
import { 
  Library, 
  Plus, 
  Eye,
  X,
  Upload,
  Loader2,
  Trash2,
  Edit,
  BookOpen
} from 'lucide-react';
import { libraryService } from '../../services/apiService';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (typeof window !== 'undefined' && 
   (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://api.example.com');

const AdminLibrary = () => {
  const [libraryItems, setLibraryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    type: 'book',
    category: 'devotional',
    description: '',
    is_free: true,
    price: '',
    tags: '',
    cover_image: null
  });

  const types = ['book', 'blog', 'quotes'];
  const categories = ['devotional', 'ministry', 'relationships', 'spiritual-growth', 'youth', 'marriage', 'family'];

  useEffect(() => {
    loadLibraryItems();
  }, []);

  const loadLibraryItems = async () => {
    try {
      setLoading(true);
      const data = await libraryService.getLibraryItems();
      setLibraryItems(data);
    } catch (error) {
      console.error('Error loading library items:', error);
      toast.error('Failed to load library items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let coverImageUrl = null;

      if (formData.cover_image) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', formData.cover_image);
        const token = localStorage.getItem('fog_user') ? JSON.parse(localStorage.getItem('fog_user')).backendToken : null;
        
        const response = await fetch(`${API_BASE_URL}/api/library/upload-cover`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataUpload,
        });

        if (!response.ok) throw new Error('Failed to upload cover');
        const result = await response.json();
        coverImageUrl = result.url;
      }

      const itemData = {
        title: formData.title,
        author: formData.author,
        type: formData.type,
        category: formData.category,
        description: formData.description,
        is_free: formData.is_free,
        price: formData.price ? parseFloat(formData.price) : null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).join(',') : null,
        cover_image: coverImageUrl
      };

      if (editingItem) {
        await libraryService.updateLibraryItem(editingItem.id, itemData);
        toast.success('Library item updated successfully!');
      } else {
        await libraryService.createLibraryItem(itemData);
        toast.success('Library item created successfully!');
      }

      setShowForm(false);
      setEditingItem(null);
      resetForm();
      loadLibraryItems();
    } catch (error) {
      console.error('Error saving library item:', error);
      toast.error(error.message || 'Failed to save library item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this library item?')) {
      return;
    }

    try {
      await libraryService.deleteLibraryItem(id);
      toast.success('Library item deleted successfully!');
      loadLibraryItems();
    } catch (error) {
      console.error('Error deleting library item:', error);
      toast.error('Failed to delete library item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      author: item.author || '',
      type: item.type || 'book',
      category: item.category || 'devotional',
      description: item.description || '',
      is_free: item.is_free !== undefined ? item.is_free : true,
      price: item.price || '',
      tags: item.tags || '',
      cover_image: null
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      type: 'book',
      category: 'devotional',
      description: '',
      is_free: true,
      price: '',
      tags: '',
      cover_image: null
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    resetForm();
  };

  if (loading) {
    return (
      <AdminLayout title="Library" subtitle="Manage resources">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Library" subtitle="Manage resources">
    <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Library Management</h1>
              <p className="mt-2 text-gray-600">Manage library items and resources</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingItem(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Library Item
            </button>
          </div>
        </div>

        {/* Library Items List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Free</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {libraryItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No library items found. Click "Add Library Item" to create one.
                    </td>
                  </tr>
                ) : (
                  libraryItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.cover_image ? (
                          <img src={item.cover_image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.is_free ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.is_free ? 'Free' : `$${item.price || '0'}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingItem ? 'Edit Library Item' : 'Add New Library Item'}
                </h3>
                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                    <input
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      {types.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_free}
                        onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Free Item</span>
                    </label>
                  </div>
                  {!formData.is_free && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="spiritual, growth, faith"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {editingItem ? 'Update' : 'Create'} Library Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLibrary;

