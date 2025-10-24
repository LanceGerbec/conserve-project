// src/pages/About.js - With Editable Team Section
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Edit2, Plus, Trash2, X, Upload } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import LoadingButton from '../components/LoadingButton';

const About = () => {
  const { isAdmin } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    order: 0
  });

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const { data } = await api.get('/team');
      setTeamMembers(data.members);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        role: member.role,
        order: member.order
      });
      setPhotoPreview(member.photoUrl);
    } else {
      setEditingMember(null);
      setFormData({ name: '', role: '', order: teamMembers.length });
      setPhotoPreview(null);
    }
    setPhotoFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMember(null);
    setFormData({ name: '', role: '', order: 0 });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.role.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('role', formData.role);
      submitData.append('order', formData.order);
      
      if (photoFile) {
        submitData.append('photo', photoFile);
      }

      if (editingMember) {
        await api.put(`/team/${editingMember._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Team member updated');
      } else {
        await api.post('/team', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Team member added');
      }
      
      fetchTeam();
      handleCloseModal();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save team member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) {
      return;
    }

    try {
      await api.delete(`/team/${id}`);
      toast.success('Team member deleted');
      fetchTeam();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete team member');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            About ConServe
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive research repository system for NEUST College of Nursing,
            preserving and sharing nursing research for future generations.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            ConServe aims to provide a centralized, accessible platform for nursing
            research papers from NEUST College of Nursing. We believe in the power
            of knowledge sharing and aim to facilitate research discovery, promote
            academic excellence, and support the nursing community through easy
            access to quality research materials.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Smart Search
            </h3>
            <p className="text-gray-600">
              Advanced search with typo tolerance and fuzzy matching to find
              exactly what you need.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-apricot-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Organized Repository
            </h3>
            <p className="text-gray-600">
              Well-categorized research papers by subject areas and year for easy
              navigation.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Secure & Private
            </h3>
            <p className="text-gray-600">
              Enterprise-grade security with data privacy compliance and ethical
              considerations.
            </p>
          </div>
        </div>

        {/* Development Team */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Development Team
            </h2>
            {isAdmin && (
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center space-x-2 px-4 py-2 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition"
              >
                <Plus size={20} />
                <span>Add Member</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="spinner mx-auto"></div>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No team members yet</p>
              {isAdmin && (
                <button
                  onClick={() => handleOpenModal()}
                  className="mt-4 text-navy-700 hover:underline"
                >
                  Add the first team member
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {teamMembers.map((member) => (
                <div key={member._id} className="text-center group relative">
                  {isAdmin && (
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
                      <button
                        onClick={() => handleOpenModal(member)}
                        className="p-1 bg-navy-700 text-white rounded hover:bg-navy-800"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                  
                  <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {member.photoUrl ? (
                      <img
                        src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${member.photoUrl}`}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.textContent = member.name.charAt(0);
                        }}
                      />
                    ) : (
                      member.name.charAt(0)
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Institution */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Nueva Ecija University of Science and Technology
          </h3>
          <p className="text-gray-600 text-lg">
            College of Nursing
            <br />
            Cabanatuan City, Nueva Ecija, Philippines
          </p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo
                </label>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-3 flex items-center justify-center">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="text-gray-400" size={32} />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer transition text-sm"
                  >
                    Choose Photo
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field"
                  placeholder="Developer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="input-field"
                  min="0"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <LoadingButton
                  type="submit"
                  loading={submitting}
                  className="flex-1 btn-primary"
                >
                  {editingMember ? 'Update' : 'Add'}
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;