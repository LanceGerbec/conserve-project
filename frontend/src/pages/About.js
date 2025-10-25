// src/pages/About.js - NAVY BLUE NURSING THEME
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Edit2, Plus, Trash2, X, Upload, Search, BookOpen, Lock, Heart, Stethoscope, Shield, Users, Award, Globe } from 'lucide-react';
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    order: 0
  });

  // Optimized particle animation
  useEffect(() => {
    const canvas = document.getElementById('about-particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 30;

    class MedicalParticle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.3 - 0.15;
        this.speedY = Math.random() * 0.3 - 0.15;
        this.opacity = Math.random() * 0.4 + 0.2;
        this.baseOpacity = this.opacity;
        this.hue = 210;
      }

      update(mouseX, mouseY) {
        this.x += this.speedX;
        this.y += this.speedY;

        this.pulsePhase += 0.05;
        const pulse = Math.sin(this.pulsePhase) * 0.3;
        
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          this.opacity = Math.min(this.baseOpacity * 2, 0.8);
          this.x -= dx * 0.008;
          this.y -= dy * 0.008;
        } else {
          this.opacity = this.baseOpacity + pulse * 0.2;
        }

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        gradient.addColorStop(0, `hsla(${this.hue}, 60%, 50%, ${this.opacity})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 60%, 50%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new MedicalParticle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update(mousePosition.x, mousePosition.y);
        particle.draw();
      });

      particles.forEach((p1, i) => {
        particles.slice(i + 1, i + 4).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.12 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mousePosition]);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Particle Canvas */}
      <canvas 
        id="about-particle-canvas" 
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.3 }}
      />

      {/* Medical Cross Pattern Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231e3a8a' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Animated Navy Blue Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-navy-700 to-blue-900 rounded-3xl flex items-center justify-center shadow-2xl">
                <Heart className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-navy-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                About ConServe
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A comprehensive research repository system for NEUST College of Nursing,
              preserving and sharing nursing research for future generations.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-3xl shadow-xl p-10 mb-12 border border-gray-100 animate-fade-in-up animation-delay-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-navy-100 rounded-xl">
                <Stethoscope className="w-8 h-8 text-navy-700" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900">Our Mission</h2>
            </div>
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
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:-translate-y-2 border-t-4 border-navy-600 animate-fade-in-up animation-delay-300">
              <div className="flex items-center justify-center w-16 h-16 bg-navy-100 rounded-2xl mb-4">
                <Search className="w-8 h-8 text-navy-700" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Smart Search
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced search with typo tolerance and fuzzy matching to find
                exactly what you need.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:-translate-y-2 border-t-4 border-blue-600 animate-fade-in-up animation-delay-400">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                <BookOpen className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Organized Repository
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Well-categorized research papers by subject areas and year for easy
                navigation.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:-translate-y-2 border-t-4 border-indigo-600 animate-fade-in-up animation-delay-500">
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
                <Shield className="w-8 h-8 text-indigo-700" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Secure & Private
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Enterprise-grade security with data privacy compliance and ethical
                considerations.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="mb-12 animate-fade-in-up animation-delay-600">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-8">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-all border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-navy-100 rounded-2xl mb-4">
                  <Shield className="w-8 h-8 text-navy-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Assured</h3>
                <p className="text-gray-600 text-sm">
                  Rigorous peer review for all submissions
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-all border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Open Access</h3>
                <p className="text-gray-600 text-sm">
                  Free knowledge for all professionals
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-all border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Community Driven</h3>
                <p className="text-gray-600 text-sm">
                  Built by nurses, for nurses
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-all border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Recognition</h3>
                <p className="text-gray-600 text-sm">
                  Proper attribution and tracking
                </p>
              </div>
            </div>
          </div>

          {/* Development Team */}
          <div className="bg-white rounded-3xl shadow-xl p-10 mb-12 border border-gray-100 animate-fade-in-up animation-delay-700">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-navy-100 rounded-xl">
                  <Users className="w-8 h-8 text-navy-700" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900">
                  Development Team
                </h2>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleOpenModal()}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-navy-700 to-blue-800 text-white rounded-xl hover:from-navy-800 hover:to-blue-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Plus size={20} />
                  <span className="font-semibold">Add Member</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-navy-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading team members...</p>
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-4">No team members yet</p>
                {isAdmin && (
                  <button
                    onClick={() => handleOpenModal()}
                    className="text-navy-700 font-semibold hover:underline"
                  >
                    Add the first team member
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                {teamMembers.map((member, index) => (
                  <div 
                    key={member._id} 
                    className="text-center group relative animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {isAdmin && (
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
                        <button
                          onClick={() => handleOpenModal(member)}
                          className="p-2 bg-navy-700 text-white rounded-lg hover:bg-navy-800 shadow-lg"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(member._id)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    
                    <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-navy-600 to-blue-800 flex items-center justify-center text-white text-3xl font-bold shadow-xl group-hover:shadow-2xl transition-all transform group-hover:scale-105">
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
                    <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{member.role}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Institution */}
          <div className="text-center bg-white rounded-3xl shadow-xl p-10 border border-gray-100 animate-fade-in-up animation-delay-800">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-navy-600 to-blue-800 rounded-2xl mb-6">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Nueva Ecija University of Science and Technology
            </h3>
            <p className="text-xl text-gray-700 font-semibold mb-2">
              College of Nursing
            </p>
            <p className="text-gray-600">
              Cabanatuan City, Nueva Ecija, Philippines
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Profile Photo
                </label>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 mb-4 flex items-center justify-center shadow-lg">
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
                    className="px-6 py-2 bg-navy-100 text-navy-700 rounded-xl hover:bg-navy-200 cursor-pointer transition font-medium"
                  >
                    Choose Photo
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role *
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                  placeholder="Developer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                  min="0"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <LoadingButton
                  type="submit"
                  loading={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-navy-700 to-blue-800 hover:from-navy-800 hover:to-blue-900 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {editingMember ? 'Update' : 'Add Member'}
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