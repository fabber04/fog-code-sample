import React from 'react';
import { GraduationCap, Settings } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

const AdminGeniusAcademy = () => {
  return (
    <AdminLayout title="Genius Academy" subtitle="Course management">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
          <GraduationCap className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Genius Academy Management</h1>
          <p className="text-gray-600 mb-6">Course and class management interface coming soon.</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Settings className="w-5 h-5" />
            <span>Admin management features will be available here</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminGeniusAcademy;
