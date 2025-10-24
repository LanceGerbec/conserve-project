// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Clock, Check, X, BookOpen, Users, FileText, Settings, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pendingResearch, setPendingResearch] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [pendingRes, statsRes] = await Promise.all([
        api.get('/admin/research/pending'),
        api.get('/analytics/stats')
      ]);

      setPendingResearch(pendingRes.data.researches || []);
      setStats(statsRes.data.stats || {});
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/research/${id}/approve`);
      toast.success('Research approved!');
      fetchData();
      setSelectedResearch(null);
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Failed to approve research');
    }
  };

  const handleReject = async (id) => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide review notes');
      return;
    }

    try {
      await api.put(`/admin/research/${id}/reject`, { reviewNotes });
      toast.success('Research rejected with feedback');
      fetchData();
      setSelectedResearch(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Failed to reject research');
    }
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Admin Dashboard
        </h1>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/admin/subjects"
            className="bg-gradient-to-r from-navy-700 to-navy-900 text-white rounded-xl p-6 hover:shadow-lg transition transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Subject Areas</h3>
                <p className="text-sm text-gray-200">Manage categories</p>
              </div>
              <Settings size={32} />
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="bg-gradient-to-r from-apricot-500 to-apricot-600 text-white rounded-xl p-6 hover:shadow-lg transition transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">User Management</h3>
                <p className="text-sm text-gray-100">Manage users</p>
              </div>
              <Users size={32} />
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 hover:shadow-lg transition transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Analytics</h3>
                <p className="text-sm text-gray-100">View statistics</p>
              </div>
              <TrendingUp size={32} />
            </div>
          </Link>
        </div>

<Link
  to="/admin/research"
  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:shadow-lg transition transform hover:-translate-y-1"
>
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-lg font-semibold mb-1">Manage Research</h3>
      <p className="text-sm text-gray-100">Edit and organize</p>
    </div>
    <FileText size={32} />
  </div>
</Link>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm mb-1">Total Users</p>
            <p className="text-3xl font-bold text-navy-700">
              {stats?.totalUsers || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm mb-1">Total Research</p>
            <p className="text-3xl font-bold text-green-600">
              {stats?.totalResearch || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-orange-600">
              {stats?.pendingResearch || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm mb-1">Total Views</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats?.totalViews || 0}
            </p>
          </div>
        </div>

        {/* Pending Research */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Pending Research Submissions ({pendingResearch.length})
          </h2>

          {pendingResearch.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No pending submissions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingResearch.map((research) => (
                <div
                  key={research._id}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {research.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Submitted by: {research.submittedBy?.firstName || 'Unknown'}{' '}
                        {research.submittedBy?.lastName || ''} 
                        {research.submittedBy?.email ? ` (${research.submittedBy.email})` : ''}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Subject: {research.subjectArea?.name || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {research.abstract}
                  </p>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(research._id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Check size={18} />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => setSelectedResearch(research)}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <X size={18} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {selectedResearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reject Research</h3>
            <p className="text-gray-600 mb-4">
              Please provide feedback for the author:
            </p>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg mb-4"
              rows="4"
              placeholder="Enter your review notes..."
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSelectedResearch(null);
                  setReviewNotes('');
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedResearch._id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;