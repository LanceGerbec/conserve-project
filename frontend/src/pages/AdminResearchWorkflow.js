// frontend/src/pages/AdminResearchWorkflow.js - NEW FILE
import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Upload, CheckCircle, Globe, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminResearchWorkflow = () => {
  const [activeTab, setActiveTab] = useState('completed'); // completed | published
  const [completedResearch, setCompletedResearch] = useState([]);
  const [publishedResearch, setPublishedResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [completedRes, publishedRes] = await Promise.all([
        api.get('/admin/research/completed'),
        api.get('/admin/research/published')
      ]);

      setCompletedResearch(completedRes.data.researches || []);
      setPublishedResearch(publishedRes.data.researches || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load research data');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await api.put(`/admin/research/${id}/publish`);
      toast.success('Research published successfully!');
      fetchData();
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish research');
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await api.put(`/admin/research/${id}/unpublish`);
      toast.success('Research moved to completed section');
      fetchData();
    } catch (error) {
      console.error('Unpublish error:', error);
      toast.error('Failed to unpublish research');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/research/${id}`);
      toast.success('Research deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete research');
    }
  };

  const handleViewPDF = (research) => {
    if (!research || !research.pdfUrl) {
      toast.error('PDF not available');
      return;
    }

    window.open(research.pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const ResearchTable = ({ researches, type }) => {
    if (researches.length === 0) {
      return (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-4">
            {type === 'completed' ? <CheckCircle className="w-10 h-10 text-gray-400" /> : <Globe className="w-10 h-10 text-gray-400" />}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No {type} research found
          </h3>
          <p className="text-gray-500">
            {type === 'completed' 
              ? 'Approved research will appear here before being published' 
              : 'Publish research from the completed section to make them visible'}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subject</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Year</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                {type === 'completed' ? 'Approved' : 'Published'}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {researches.map((research) => (
              <tr key={research._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="max-w-md">
                    <p className="font-medium text-gray-900 line-clamp-2 mb-1">
                      {research.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      by {research.authors?.[0]?.name}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-navy-100 text-navy-700 rounded-full text-xs font-medium">
                    {research.subjectArea?.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {research.yearPublished}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                    {research.category || 'other'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(type === 'completed' ? research.approvedAt : research.publishedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedResearch(research);
                        setShowDetailsModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleViewPDF(research)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      title="View PDF"
                    >
                      <Upload size={18} />
                    </button>
                    {type === 'completed' ? (
                      <button
                        onClick={() => handlePublish(research._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Publish to Homepage"
                      >
                        <Globe size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnpublish(research._id)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                        title="Move to Completed"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(research._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
            Research Publication Workflow
          </h1>
          <p className="text-gray-600">
            Manage completed research and control what appears on the homepage
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Completed Research</p>
                  <p className="text-3xl font-bold text-gray-900">{completedResearch.length}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Approved and finalized, awaiting publication
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Published Research</p>
                  <p className="text-3xl font-bold text-gray-900">{publishedResearch.length}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Visible on homepage to all users
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition ${
                  activeTab === 'completed'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CheckCircle className="mr-2" size={20} />
                Completed Section ({completedResearch.length})
              </button>
              <button
                onClick={() => setActiveTab('published')}
                className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition ${
                  activeTab === 'published'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Globe className="mr-2" size={20} />
                Published Section ({publishedResearch.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'completed' && (
              <>
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 flex items-start">
                    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Completed Section:</strong> Research papers here are approved and finalized, 
                      but not yet visible on the homepage. Use the <Globe size={14} className="inline" /> button 
                      to publish them and make them accessible to users.
                    </span>
                  </p>
                </div>
                <ResearchTable researches={completedResearch} type="completed" />
              </>
            )}

            {activeTab === 'published' && (
              <>
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 flex items-start">
                    <Globe className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Published Section:</strong> Research papers here are live on the homepage 
                      and accessible to all authorized users. Use the <CheckCircle size={14} className="inline" /> button 
                      to move them back to completed if needed.
                    </span>
                  </p>
                </div>
                <ResearchTable researches={publishedResearch} type="published" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedResearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Research Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase">Title</label>
                <p className="text-lg font-bold text-gray-900 mt-1">{selectedResearch.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase">Subject Area</label>
                  <p className="text-gray-900 mt-1">{selectedResearch.subjectArea?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase">Year Published</label>
                  <p className="text-gray-900 mt-1">{selectedResearch.yearPublished}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase">Authors</label>
                <div className="mt-1">
                  {selectedResearch.authors.map((author, idx) => (
                    <p key={idx} className="text-gray-900">{author.name}</p>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase">Abstract</label>
                <p className="text-gray-700 mt-1 leading-relaxed">{selectedResearch.abstract}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase">Keywords</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedResearch.keywords.map((keyword, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => handleViewPDF(selectedResearch)}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
                >
                  View PDF
                </button>
                {selectedResearch.publicationStatus === 'completed' ? (
                  <button
                    onClick={() => {
                      handlePublish(selectedResearch._id);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                  >
                    Publish
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleUnpublish(selectedResearch._id);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition"
                  >
                    Unpublish
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResearchWorkflow;