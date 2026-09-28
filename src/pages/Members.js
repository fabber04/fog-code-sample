import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { memberService } from '../services/apiService';
import toast from 'react-hot-toast';
import MobilePageHeader from '../components/mobile/MobilePageHeader';
import MobilePageNotificationBell from '../components/notifications/MobilePageNotificationBell';
import MobileFilterPill from '../components/mobile/MobileFilterPill';
import MobileListCard from '../components/mobile/MobileListCard';

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    location: '',
    role: 'Member'
  });

  // Load members from API
  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await memberService.getMembers(0, 100);
      // Map backend data to frontend format
      const mappedMembers = data.map(user => ({
        id: user.id,
        name: user.full_name,
        email: user.email,
        username: user.username,
        phone: user.phone || 'Not provided',
        joinDate: new Date(user.created_at).toLocaleDateString('en-GB'),
        status: user.is_active ? 'Active' : 'Inactive',
        location: user.location || 'Not specified',
        role: user.is_admin ? 'Admin' : (user.role || 'Member'),
        is_admin: user.is_admin,
        is_active: user.is_active
      }));
      setMembers(mappedMembers);
    } catch (error) {
      console.error('Error loading members:', error);
      setError('Failed to load members. Please check your connection.');
      toast.error('Failed to load members from API');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const exportToExcel = (exportAll = false) => {
    try {
      // Determine which data to export
      const dataToExport = exportAll ? members : filteredMembers;
      
      // Prepare data for export
      const exportData = dataToExport.map(member => ({
        'Full Name': member.name,
        'Email': member.email,
        'Phone': member.phone,
        'Join Date': member.joinDate,
        'Status': member.status,
        'Location': member.location,
        'Role': member.role
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths for better formatting
      const columnWidths = [
        { wch: 20 }, // Full Name
        { wch: 25 }, // Email
        { wch: 18 }, // Phone
        { wch: 12 }, // Join Date
        { wch: 10 }, // Status
        { wch: 20 }, // Location
        { wch: 12 }  // Role
      ];
      worksheet['!cols'] = columnWidths;

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'FOG Members');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `FOG_Members_${currentDate}.xlsx`;

      // Save the file
      XLSX.writeFile(workbook, filename);

      // Show success message
      const exportType = exportAll ? 'all' : 'filtered';
      alert(`Successfully exported ${dataToExport.length} members (${exportType}) to ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      // Create member via backend API
      const memberData = {
        full_name: formData.full_name,
        email: formData.email,
        username: formData.username || formData.email.split('@')[0],
        password: formData.password || 'TempPassword123!', // In production, generate secure password
        is_admin: formData.role === 'Admin',
        is_active: true
      };

      await memberService.createMember(memberData);
      toast.success('Member added successfully!');
      setShowAddForm(false);
      setFormData({
        full_name: '',
        email: '',
        username: '',
        password: '',
        phone: '',
        location: '',
        role: 'Member'
      });
      // Reload members
      loadMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error.message || 'Failed to add member');
    }
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setFormData({
      full_name: member.name,
      email: member.email,
      username: member.username || '',
      password: '',
      phone: member.phone || '',
      location: member.location || '',
      role: member.role
    });
    setShowAddForm(true);
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;

    try {
      const updateData = {
        full_name: formData.full_name,
        email: formData.email,
        username: formData.username || formData.email.split('@')[0],
        is_admin: formData.role === 'Admin',
        is_active: formData.role !== 'Inactive'
      };

      await memberService.updateMember(selectedMember.id, updateData);
      toast.success('Member updated successfully!');
      setShowAddForm(false);
      setSelectedMember(null);
      setFormData({
        full_name: '',
        email: '',
        username: '',
        password: '',
        phone: '',
        location: '',
        role: 'Member'
      });
      // Reload members
      loadMembers();
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error(error.message || 'Failed to update member');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      return;
    }

    try {
      await memberService.deleteMember(memberId);
      toast.success('Member deleted successfully!');
      // Reload members
      loadMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error(error.message || 'Failed to delete member. User may have associated data.');
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const statusFilterOptions = [
    { id: 'all', name: 'All Members' },
    { id: 'Active', name: 'Active' },
    { id: 'Pending', name: 'Pending' },
    { id: 'Inactive', name: 'Inactive' },
  ];

  return (
    <div className="min-h-full bg-white lg:min-h-screen lg:bg-gray-50 lg:py-8">
      <MobilePageHeader title="Members" icon={Users} rightSlot={<MobilePageNotificationBell />} />

      <div className="lg:hidden">
        <MobileFilterPill
          value={filterStatus}
          onChange={setFilterStatus}
          options={statusFilterOptions}
          label="Filter members"
        />
        <div className="px-4 pb-8 pt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <p className="py-12 text-center text-sm text-red-600">{error}</p>
          ) : filteredMembers.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No members found.</p>
          ) : (
            filteredMembers.map((member) => (
              <MobileListCard
                key={member.id}
                title={member.full_name || member.name}
                subtitle={`${member.role || 'Member'} · ${member.status || 'Active'}`}
                description={member.location || member.email || 'FOG community member'}
                actionLabel="View"
                onAction={() => setSelectedMember(member)}
              />
            ))
          )}
        </div>
      </div>

      <div className="mx-auto hidden max-w-7xl px-4 sm:px-6 lg:block lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">FOG Community Members</h1>
          <p className="mt-2 text-gray-600">
            Manage our growing FOG family across Zimbabwe - from Harare to Bulawayo, Chitungwiza to Mutare
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportToExcel}
                  className="flex items-center px-4 py-2 text-sm font-medium text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50"
                  title={`Export ${filteredMembers.length} members to Excel`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel ({filteredMembers.length})
                </button>
                {filteredMembers.length !== members.length && (
                  <button
                    onClick={() => exportToExcel(true)}
                    className="flex items-center px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="Export all members to Excel"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Export All ({members.length})
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">{error}</span>
          </div>
        )}

        {/* Members Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin mr-3" />
              <span className="text-gray-600">Loading members...</span>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.email}</div>
                      <div className="text-sm text-gray-500">{member.phone}</div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {member.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.joinDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        member.status === 'Active' ? 'bg-green-100 text-green-800' :
                        member.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditMember(member)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Member Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedMember ? 'Edit Member' : 'Add New Member'}
                </h3>
                <form onSubmit={selectedMember ? handleUpdateMember : handleAddMember} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  {!selectedMember && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password *</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleFormChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Min. 6 characters"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option>Member</option>
                      <option>Admin</option>
                      <option>Pastor</option>
                      <option>Youth Leader</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setSelectedMember(null);
                        setFormData({
                          full_name: '',
                          email: '',
                          username: '',
                          password: '',
                          phone: '',
                          location: '',
                          role: 'Member'
                        });
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                    >
                      {selectedMember ? 'Update Member' : 'Add Member'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Member Details Modal */}
        {selectedMember && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Member Details</h3>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                      <span className="text-white font-medium text-lg">
                        {selectedMember.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{selectedMember.name}</h4>
                      <p className="text-sm text-gray-500">{selectedMember.role}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{selectedMember.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{selectedMember.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Joined: {selectedMember.joinDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{selectedMember.location}</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      selectedMember.status === 'Active' ? 'bg-green-100 text-green-800' :
                      selectedMember.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedMember.status}
                    </span>
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

export default Members;
