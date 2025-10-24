// src/pages/AnalyticsDashboard.js
// Purpose: Analytics and statistics dashboard

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, FileText, Eye, Download, BookMarked, Calendar } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';


const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/analytics/stats');
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Overview of system statistics and metrics
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                <p className="text-sm opacity-90">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <p className="text-3xl font-bold">{stats?.totalResearch || 0}</p>
                <p className="text-sm opacity-90">Research Papers</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <p className="text-3xl font-bold">{stats?.pendingResearch || 0}</p>
                <p className="text-sm opacity-90">Pending Review</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <p className="text-3xl font-bold">{stats?.totalViews || 0}</p>
                <p className="text-sm opacity-90">Total Views</p>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Eye className="mr-3 text-navy-600" />
              Engagement Metrics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Eye className="w-8 h-8 text-blue-600 mr-3" />
                  <span className="font-medium text-gray-700">Total Views</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {stats?.totalViews?.toLocaleString() || 0}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Download className="w-8 h-8 text-green-600 mr-3" />
                  <span className="font-medium text-gray-700">Total Downloads</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {stats?.totalDownloads?.toLocaleString() || 0}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <BookMarked className="w-8 h-8 text-purple-600 mr-3" />
                  <span className="font-medium text-gray-700">Avg. Bookmarks</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {stats?.totalResearch > 0 
                    ? Math.round((stats?.totalDownloads || 0) / stats.totalResearch)
                    : 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Quick Stats
            </h2>
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                <p className="text-sm text-gray-600">Average Views per Research</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalResearch > 0
                    ? Math.round((stats?.totalViews || 0) / stats.totalResearch)
                    : 0}
                </p>
              </div>

              <div className="p-4 border-l-4 border-green-500 bg-green-50">
                <p className="text-sm text-gray-600">Average Downloads per Research</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalResearch > 0
                    ? Math.round((stats?.totalDownloads || 0) / stats.totalResearch)
                    : 0}
                </p>
              </div>

              <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
                <p className="text-sm text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalResearch > 0
                    ? Math.round((stats.totalResearch / (stats.totalResearch + (stats.pendingResearch || 0))) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Database</span>
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                  ONLINE
                </span>
              </div>
              <p className="text-sm text-gray-600">All systems operational</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">API Server</span>
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                  ONLINE
                </span>
              </div>
              <p className="text-sm text-gray-600">All endpoints responding</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">File Storage</span>
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                  ONLINE
                </span>
              </div>
              <p className="text-sm text-gray-600">Upload system active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;