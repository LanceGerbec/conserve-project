// src/pages/AdminResearchManagement.js - NEW PAGE
import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Eye, FileText } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminResearchManagement = () => {
  const [researches, setResearches] = useState([]);
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingResearch, setEditingResearch] = useState(null);
  const [deleteResearch, setDeleteResearch] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resRes, subRes] = await Promise.all([
        api.get('/admin/research/all'),
        api.get('/admin/subjects')
      ]);
      setResearches(resRes.data.researches || []);
      setSubjectAreas(subRes.data.subjects || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (research) => {
    setEditingResearch({
      ...research,
      subjectArea: research.subjectArea?._id || research.subjectArea
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    try {
      await api.put(`/admin/research/${editingResearch._id}`, {
        title: editingResearch.title,
        subjectArea: editingResearch.subjectArea,
        yearPublished: editingResearch.yearPublished
      });

      toast.success('Research updated successfully');
      fetchData();
      setShowEditModal(false);
      setEditingResearch(null);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update research');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/research/${deleteResearch._id}`);
      toast.success('Research deleted successfully');
      fetchData();
      setDeleteResearch(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete research');
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
          Manage All Research
        </h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Subject Area
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Year
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {researches.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No research papers found
                    </td>
                  </tr>
                ) : (
                  researches.map((research) => (
                    <tr key={research._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <p className="font-medium text-gray-900 line-clamp-2">
                            {research.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            by {research.authors?.[0]?.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-navy-100 text-navy-700 rounded-full text-xs font-medium">
                          {research.subjectArea?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {research.yearPublished}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          research.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : research.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {research.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(`/research/${research._id}`, '_blank')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(research)}
                            className="p-2 text-navy-700 hover:bg-navy-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteResearch(research)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
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
      </div>

      {/* Edit Modal */}
      {showEditModal && editingResearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Edit Research
            </h2>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editingResearch.title}
                  onChange={(e) => setEditingResearch({
                    ...editingResearch,
                    title: e.target.value
                  })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Area
                </label>
                <select
                  value={editingResearch.subjectArea}
                  onChange={(e) => setEditingResearch({
                    ...editingResearch,
                    subjectArea: e.target.value
                  })}
                  className="input-field"
                  required
                >
                  <option value="">Select subject area</option>
                  {subjectAreas.map(subject => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Published
                </label>
                <input
                  type="number"
                  value={editingResearch.yearPublished}
                  onChange={(e) => setEditingResearch({
                    ...editingResearch,
                    yearPublished: parseInt(e.target.value)
                  })}
                  className="input-field"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingResearch(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteResearch}
        onClose={() => setDeleteResearch(null)}
        onConfirm={handleDelete}
        title="Delete Research"
        message={`Are you sure you want to delete "${deleteResearch?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default AdminResearchManagement;