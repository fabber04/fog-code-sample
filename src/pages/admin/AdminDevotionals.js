import React from 'react';
import { BookOpen, Settings } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

const AdminDevotionals = () => {
  return (
    <AdminLayout title="Devotionals" subtitle="Daily content">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
          <BookOpen className="w-16 h-16 text-teal-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Relationship Devotionals Management</h1>
          <p className="text-gray-600 mb-6">Devotionals content management interface coming soon.</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Settings className="w-5 h-5" />
            <span>Admin management features will be available here</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDevotionals;
