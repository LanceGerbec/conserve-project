// src/pages/AdminAuthorizedNumbers.js
import React, { useState, useEffect } from 'react';
import { Upload, Download, Plus, Trash2, Search, CheckCircle, XCircle, FileText, Users } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import LoadingButton from '../components/LoadingButton';

const AdminAuthorizedNumbers = () => {
  const [numbers, setNumbers] = useState([]);
  const [stats, setStats] = useState({ total: 0, used: 0, unused: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    studentNumber: '',
    type: 'student',
    firstName: '',
    lastName: '',
    program: '',
    yearLevel: ''
  });

  useEffect(() => {
    fetchData();
  }, [searchQuery, statusFilter]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const [numbersRes, statsRes] = await Promise.all([
        api.get(`/admin/authorized-numbers?${params.toString()}`),
        api.get('/admin/authorized-numbers/stats')
      ]);

      setNumbers(numbersRes.data.numbers || []);
      setStats(statsRes.data.stats || { total: 0, used: 0, unused: 0 });
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSingle = async (e) => {
    e.preventDefault();
    
    if (!formData.studentNumber.trim()) {
      toast.error('Student number is required');
      return;
    }

    try {
      await api.post('/admin/authorized-numbers', formData);
      toast.success('Number added successfully');
      setShowAddModal(false);
      setFormData({
        studentNumber: '',
        type: 'student',
        firstName: '',
        lastName: '',
        program: '',
        yearLevel: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add number');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', csvFile);

    try {
      const { data } = await api.post('/admin/authorized-numbers/bulk-upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(`✅ Uploaded ${data.data.inserted} numbers successfully!`);
      
      if (data.data.errors > 0) {
        toast.error(`⚠️ ${data.data.errors} numbers failed (duplicates or errors)`);
      }

      setCsvFile(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this number? This cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/authorized-numbers/${id}`);
      toast.success('Number deleted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const downloadTemplate = () => {
    const csvContent = "studentNumber,type,firstName,lastName,program,yearLevel\n2024-12345,student,John,Doe,BSN,1st Year\n2024-67890,student,Jane,Smith,BSN,2nd Year";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'authorized_numbers_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Authorized Student/Faculty Numbers
          </h1>
          <p className="text-gray-600">
            Manage who can register on ConServe
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-navy-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <p className="text-gray-600">Total Numbers</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.used}</span>
            </div>
            <p className="text-gray-600">Used (Registered)</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-orange-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.unused}</span>
            </div>
            <p className="text-gray-600">Unused (Available)</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition"
              >
                <Plus size={18} />
                <span>Add Single</span>
              </button>

              <label className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer">
                <Upload size={18} />
                <span>Bulk Upload CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setCsvFile(file);
                      const form = document.createElement('form');
                      form.onsubmit = handleBulkUpload;
                      form.dispatchEvent(new Event('submit'));
                    }
                  }}
                  className="hidden"
                />
              </label>

              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Download size={18} />
                <span>CSV Template</span>
              </button>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search numbers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
              >
                <option value="all">All Status</option>
                <option value="unused">Unused Only</option>
                <option value="used">Used Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Student Number
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Program
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Used By
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {numbers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No authorized numbers found
                    </td>
                  </tr>
                ) : (
                  numbers.map((number) => (
                    <tr key={number._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono font-medium text-gray-900">
                          {number.studentNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          number.type === 'student' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {number.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {number.firstName && number.lastName 
                          ? `${number.firstName} ${number.lastName}` 
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {number.program || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          number.isUsed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {number.isUsed ? 'Used' : 'Unused'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {number.usedBy 
                          ? `${number.usedBy.firstName} ${number.usedBy.lastName}`
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {!number.isUsed && (
                          <button
                            onClick={() => handleDelete(number._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Single Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Add Authorized Number</h3>
            
            <form onSubmit={handleAddSingle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student/Faculty Number *
                </label>
                <input
                  type="text"
                  value={formData.studentNumber}
                  onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                  className="input-field"
                  placeholder="2024-12345"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program
                </label>
                <input
                  type="text"
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  className="input-field"
                  placeholder="BSN"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Level
                </label>
                <input
                  type="text"
                  value={formData.yearLevel}
                  onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
                  className="input-field"
                  placeholder="1st Year"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Add Number
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuthorizedNumbers;