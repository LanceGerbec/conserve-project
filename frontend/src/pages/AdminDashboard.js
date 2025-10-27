// src/pages/AdminDashboard.js - FIXED FOR CLOUDINARY PDF VIEWING
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Clock, Check, X, BookOpen, Users, FileText, Settings, TrendingUp, BarChart3, Sparkles, ExternalLink, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pendingResearch, setPendingResearch] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [viewingResearch, setViewingResearch] = useState(null);
  const [showFullAbstract, setShowFullAbstract] = useState({});

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
      setViewingResearch(null);
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
      setViewingResearch(null);
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Failed to reject research');
    }
  };

  const handleRejectForIMRaD = (research) => {
    setSelectedResearch(research);
    setReviewNotes('Your research paper does not follow the required IMRaD format (Introduction, Methods, Results, and Discussion). Please restructure your paper according to IMRaD standards and resubmit. All sections must be clearly labeled and present. Refer to our submission guidelines for detailed information on the IMRaD format requirements.');
  };

  const handleViewPDF = (research) => {
    // ✅ FIX: Add fl_attachment=false to force viewing instead of downloading
    let pdfUrl = research.pdfUrl;
    
    // If it's a Cloudinary URL, add the flag to prevent download
    if (pdfUrl.includes('cloudinary.com')) {
      // Add fl_attachment=false parameter to force inline viewing
      if (pdfUrl.includes('/upload/')) {
        pdfUrl = pdfUrl.replace('/upload/', '/upload/fl_attachment:false/');
      }
    }
    
    console.log('Opening PDF:', pdfUrl);
    window.open(pdfUrl, '_blank');
    toast.success('Opening PDF in new tab...');
  };

  const toggleAbstract = (id) => {
    setShowFullAbstract(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with gradient */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-navy-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600 ml-11">Manage your research repository system</p>
        </div>

        {/* Enhanced Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/admin/subjects" className="group relative overflow-hidden bg-gradient-to-br from-navy-600 via-navy-700 to-navy-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs text-white font-medium backdrop-blur-sm">Categories</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Subject Areas</h3>
              <p className="text-sm text-gray-300 mb-4">Manage categories</p>
              <div className="flex items-center text-white text-sm font-medium">
                <span className="group-hover:mr-2 transition-all">View all</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            </div>
          </Link>

          <Link to="/admin/users" className="group relative overflow-hidden bg-gradient-to-br from-orange-400 via-apricot-500 to-orange-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs text-white font-medium backdrop-blur-sm">Users</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">User Management</h3>
              <p className="text-sm text-orange-100 mb-4">Manage users</p>
              <div className="flex items-center text-white text-sm font-medium">
                <span className="group-hover:mr-2 transition-all">View all</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            </div>
          </Link>

          <Link to="/admin/analytics" className="group relative overflow-hidden bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs text-white font-medium backdrop-blur-sm">Insights</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Analytics</h3>
              <p className="text-sm text-green-100 mb-4">View statistics</p>
              <div className="flex items-center text-white text-sm font-medium">
                <span className="group-hover:mr-2 transition-all">View all</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            </div>
          </Link>

          <Link to="/admin/research" className="group relative overflow-hidden bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs text-white font-medium backdrop-blur-sm">Research</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Manage Research</h3>
              <p className="text-sm text-purple-100 mb-4">Edit and organize</p>
              <div className="flex items-center text-white text-sm font-medium">
                <span className="group-hover:mr-2 transition-all">View all</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500 font-medium">↑ +12%</span>
            </div>
            <p className="text-gray-600 text-sm mb-1 font-medium">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500 font-medium">↑ +8%</span>
            </div>
            <p className="text-gray-600 text-sm mb-1 font-medium">Total Research</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalResearch || 0}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
              {stats?.pendingResearch > 0 && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                  {stats.pendingResearch}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-1 font-medium">Pending Review</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.pendingResearch || 0}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500 font-medium">↑ +24%</span>
            </div>
            <p className="text-gray-600 text-sm mb-1 font-medium">Total Views</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalViews || 0}</p>
          </div>
        </div>

        {/* Pending Research Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Pending Research Submissions</h2>
            </div>
            <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-bold shadow-lg">
              {pendingResearch.length} pending
            </span>
          </div>

          {pendingResearch.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Check className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-500">No pending submissions to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingResearch.map((research) => (
                <div key={research._id} className="border-2 border-gray-100 rounded-xl p-6 hover:border-orange-200 hover:bg-orange-50 transition-all duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">PENDING REVIEW</span>
                        {research.imradCompliant && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            IMRaD Format
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{new Date(research.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{research.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {research.submittedBy?.firstName || 'Unknown'} {research.submittedBy?.lastName || ''}
                        </span>
                        {research.subjectArea?.name && (
                          <span className="px-2 py-1 bg-navy-100 text-navy-700 rounded text-xs font-medium">{research.subjectArea.name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className={`text-gray-700 leading-relaxed ${!showFullAbstract[research._id] ? 'line-clamp-3' : ''}`}>
                      {research.abstract}
                    </p>
                    {research.abstract.length > 200 && (
                      <button onClick={() => toggleAbstract(research._id)} className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2">
                        {showFullAbstract[research._id] ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">⚠️ Check IMRaD Format</p>
                        <p className="text-xs text-blue-700">
                          Verify that this paper follows the IMRaD structure: <strong>Introduction, Methods, Results, and Discussion</strong> sections clearly present and labeled.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setViewingResearch(research)} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium">
                      <Eye size={18} />
                      <span>Review Details</span>
                    </button>
                    <button onClick={() => handleViewPDF(research)} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium">
                      <ExternalLink size={18} />
                      <span>View PDF</span>
                    </button>
                    <button onClick={() => handleApprove(research._id)} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium">
                      <Check size={18} />
                      <span>Approve</span>
                    </button>
                    <button onClick={() => handleRejectForIMRaD(research)} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium">
                      <AlertCircle size={18} />
                      <span>Reject (No IMRaD)</span>
                    </button>
                    <button onClick={() => setSelectedResearch(research)} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium">
                      <X size={18} />
                      <span>Reject (Other)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Details Modal */}
      {viewingResearch && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-bold text-gray-900">Research Details</h3>
              <button onClick={() => setViewingResearch(null)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {viewingResearch.imradCompliant && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-semibold text-green-900">Author confirmed this paper follows IMRaD format</p>
                  </div>
                  <p className="text-xs text-green-700 mt-1 ml-7">Please verify all sections (Introduction, Methods, Results, Discussion) are present and properly labeled.</p>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Title</label>
                <p className="text-xl font-bold text-gray-900 mt-1">{viewingResearch.title}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Authors</label>
                <div className="mt-2 space-y-2">
                  {viewingResearch.authors.map((author, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-gray-700">
                      <Users size={16} />
                      <span className="font-medium">{author.name}</span>
                      {author.email && <span className="text-gray-500 text-sm">({author.email})</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Abstract</label>
                <p className="text-gray-700 leading-relaxed mt-2 bg-gray-50 p-4 rounded-lg">{viewingResearch.abstract}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Keywords</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {viewingResearch.keywords.map((keyword, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{keyword}</span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Subject Area</label>
                  <p className="text-gray-900 font-medium mt-1">{viewingResearch.subjectArea?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Year Published</label>
                  <p className="text-gray-900 font-medium mt-1">{viewingResearch.yearPublished}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <button onClick={() => handleViewPDF(viewingResearch)} className="flex-1 min-w-[180px] flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium">
                  <ExternalLink size={18} />
                  <span>View Full PDF</span>
                </button>
                <button onClick={() => handleApprove(viewingResearch._id)} className="flex-1 min-w-[180px] flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-medium">
                  <Check size={18} />
                  <span>Approve</span>
                </button>
                <button onClick={() => { setViewingResearch(null); handleRejectForIMRaD(viewingResearch); }} className="flex-1 min-w-[180px] flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg font-medium">
                  <AlertCircle size={18} />
                  <span>Reject (No IMRaD)</span>
                </button>
                <button onClick={() => { setViewingResearch(null); setSelectedResearch(viewingResearch); }} className="flex-1 min-w-[180px] flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-medium">
                  <X size={18} />
                  <span>Reject (Other)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {selectedResearch && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-red-100 rounded-xl">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Reject Research</h3>
            </div>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Please provide constructive feedback to help the author improve their submission:
            </p>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all resize-none focus:outline-none"
              rows="5"
              placeholder="Enter your review notes..."
            />
            <div className="flex space-x-3">
              <button onClick={() => { setSelectedResearch(null); setReviewNotes(''); }} className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700">
                Cancel
              </button>
              <button onClick={() => handleReject(selectedResearch._id)} className="flex-1 px-6 py-3 bg-gradient-to--r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-medium">
                Reject & Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;