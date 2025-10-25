// src/pages/Home.js - DARK NAVY BLUE NURSING THEME (Fixed Parallax)
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp, Clock, Sparkles, ArrowRight, Search, Filter, Star, Zap, Heart, Users, Award, FileText, Activity, Stethoscope, Shield, Globe } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ResearchCard from '../components/ResearchCard';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [researches, setResearches] = useState([]);
  const [popularResearch, setPopularResearch] = useState([]);
  const [recentResearch, setRecentResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [filters, setFilters] = useState({
    search: '',
    subjectArea: '',
    year: '',
    sort: 'recent'
  });

  // Optimized particle animation - reduced count for better performance
  useEffect(() => {
    const canvas = document.getElementById('home-particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 30; // Reduced from 50 to 30 for better performance

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
        this.hue = 210; // Navy blue hue
      }

      update(mouseX, mouseY) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Pulse effect
        this.pulsePhase += 0.05;
        const pulse = Math.sin(this.pulsePhase) * 0.3;
        
        // Mouse interaction
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

      // Draw connections - optimized
      particles.forEach((p1, i) => {
        particles.slice(i + 1, i + 4).forEach(p2 => { // Only connect to nearest 3 particles
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) { // Reduced from 120 to 100
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
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.subjectArea) params.append('subjectArea', filters.subjectArea);
      if (filters.year) params.append('year', filters.year);
      if (filters.sort) params.append('sort', filters.sort);

      const [allRes, popularRes, recentRes] = await Promise.all([
        api.get(`/research?${params.toString()}`),
        api.get('/research/popular'),
        api.get('/research/recent')
      ]);

      setResearches(allRes.data.researches);
      setPopularResearch(popularRes.data.researches);
      setRecentResearch(recentRes.data.researches);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters({ ...filters, search: searchTerm });
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Medical-themed Particle Canvas - Reduced opacity */}
      <canvas 
        id="home-particle-canvas" 
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.3 }}
      />
      
      {/* Subtle Medical Cross Pattern Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231e3a8a' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      {/* Animated Navy Blue Blobs - Simplified */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Professional Healthcare Hero Section - NO PARALLAX */}
        <div className="relative bg-gradient-to-r from-navy-900 via-blue-900 to-indigo-900 text-white py-32 overflow-hidden">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }}></div>
          </div>

          {/* Floating Healthcare Icons - Simplified */}
          <div className="absolute inset-0 overflow-hidden">
            <Stethoscope className="absolute top-32 right-40 w-12 h-12 text-indigo-300 opacity-15 animate-float animation-delay-1000" />
            <Activity className="absolute bottom-40 left-1/4 w-10 h-10 text-navy-300 opacity-20 animate-float animation-delay-2000" />
            <Shield className="absolute bottom-32 right-1/3 w-11 h-11 text-blue-200 opacity-15 animate-float animation-delay-1500" />
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              {/* Professional Badge */}
              <div className="inline-flex items-center space-x-3 px-5 py-2 bg-white bg-opacity-15 backdrop-blur-md rounded-full mb-6 animate-fade-in-down border border-white border-opacity-20">
                <BookOpen className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold tracking-wide">NEUST College of Nursing</span>
              </div>

              <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in-up">
                <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
                  ConServe
                </span>
              </h1>
              <p className="text-2xl text-blue-100 mb-3 animate-fade-in-up animation-delay-200 font-light">
                Advancing Nursing Through Research Excellence
              </p>
              <p className="text-lg text-blue-200 animate-fade-in-up animation-delay-400 max-w-2xl mx-auto">
                Discover evidence-based research, explore innovative healthcare practices, and contribute to the future of nursing
              </p>
            </div>

            {/* Enhanced Search Bar with Healthcare Accent */}
            <div className="flex justify-center mb-10 animate-fade-in-up animation-delay-600">
              <div className="relative w-full max-w-3xl group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-navy-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative">
                  <SearchBar 
                    onSearch={handleSearch} 
                    placeholder="🔍 Search research by title, author, keywords, or specialty..."
                  />
                </div>
              </div>
            </div>

            {/* Professional Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-800">
              {isAuthenticated ? (
                <Link
                  to="/submit"
                  className="group relative inline-flex items-center space-x-2 px-8 py-4 bg-white text-navy-700 rounded-xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:bg-blue-50"
                >
                  <FileText className="w-5 h-5" />
                  <span>Submit Research</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group relative inline-flex items-center space-x-2 px-8 py-4 bg-white text-navy-700 rounded-xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:bg-blue-50"
                  >
                    <Users className="w-5 h-5" />
                    <span>Join Community</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center space-x-2 px-8 py-4 bg-white bg-opacity-10 backdrop-blur-md hover:bg-opacity-20 rounded-xl font-semibold text-lg transition-all border-2 border-white border-opacity-30 hover:border-opacity-50 transform hover:-translate-y-1"
                  >
                    <span>Sign In</span>
                  </Link>
                </>
              )}
              <Link
                to="/about"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-navy-800 bg-opacity-50 backdrop-blur-md hover:bg-opacity-70 rounded-xl font-semibold text-lg transition-all border-2 border-white border-opacity-20 hover:border-opacity-40 transform hover:-translate-y-1"
              >
                <Globe className="w-5 h-5" />
                <span>Learn More</span>
              </Link>
            </div>

            {/* Healthcare Stats Banner */}
            <div className="grid grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-1000">
              <div className="text-center bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 border border-white border-opacity-20">
                <div className="text-3xl font-bold text-white">{researches.length}+</div>
                <div className="text-sm text-blue-100 mt-1">Research Papers</div>
              </div>
              <div className="text-center bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 border border-white border-opacity-20">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-sm text-blue-100 mt-1">Citations</div>
              </div>
              <div className="text-center bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 border border-white border-opacity-20">
                <div className="text-3xl font-bold text-white">100+</div>
                <div className="text-sm text-blue-100 mt-1">Contributors</div>
              </div>
            </div>
          </div>

          {/* Smooth Wave Separator */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" className="w-full h-auto">
              <path 
                fill="rgb(248, 250, 252)" 
                d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              ></path>
            </svg>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 -mt-8">
          {/* Healthcare-Themed Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-navy-600 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-navy-600 to-blue-700 rounded-xl">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center space-x-1 text-xs text-green-600 font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span>+15%</span>
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">
                {researches.length}
              </h3>
              <p className="text-gray-600 font-medium mb-1">Evidence-Based Research</p>
              <p className="text-sm text-gray-500">Peer-reviewed publications</p>
            </div>

            <div className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-blue-600 animate-fade-in-up animation-delay-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center space-x-1 text-xs text-orange-600 font-medium">
                  <Star className="w-4 h-4 fill-current" />
                  <span>Featured</span>
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">
                {popularResearch.length}
              </h3>
              <p className="text-gray-600 font-medium mb-1">High-Impact Studies</p>
              <p className="text-sm text-gray-500">Most cited research</p>
            </div>

            <div className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-indigo-600 animate-fade-in-up animation-delay-400">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center space-x-1 text-xs text-green-600 font-medium">
                  <Zap className="w-4 h-4" />
                  <span>Updated</span>
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">
                {recentResearch.length}
              </h3>
              <p className="text-gray-600 font-medium mb-1">Recent Publications</p>
              <p className="text-sm text-gray-500">Latest contributions</p>
            </div>
          </div>

          {/* Filter Toggle Button - Mobile */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-navy-100"
            >
              <Filter className="w-5 h-5 text-navy-600" />
              <span className="font-medium text-gray-900">{showFilters ? 'Hide' : 'Show'} Filters</span>
            </button>
          </div>

          {/* Filter & Research Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-24 animate-fade-in-right">
                <FilterPanel 
                  onFilterChange={handleFilterChange}
                  initialFilters={filters}
                />
              </div>
            </div>

            {/* Research Results */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-md border border-navy-100">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-navy-600 rounded-full animate-spin"></div>
                    <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-navy-600 animate-pulse" />
                  </div>
                  <p className="text-gray-600 font-medium">Loading research...</p>
                </div>
              ) : researches.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-md border border-navy-100 animate-fade-in">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-navy-50 rounded-full mb-4">
                    <Search className="w-10 h-10 text-navy-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    No research found
                  </p>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search criteria or filters
                  </p>
                  <button
                    onClick={() => setFilters({ search: '', subjectArea: '', year: '', sort: 'recent' })}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-navy-600 to-blue-600 text-white rounded-xl hover:from-navy-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <span>Clear all filters</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-navy-600 to-blue-600 rounded-full"></div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          {researches.length} Research {researches.length !== 1 ? 'Papers' : 'Paper'}
                        </p>
                        <p className="text-sm text-gray-500">Evidence-based nursing research</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {researches.map((research, index) => (
                      <div 
                        key={research._id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <ResearchCard research={research} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Featured Sections with Healthcare Design */}
          {!filters.search && !filters.subjectArea && !filters.year && (
            <>
              <section className="mt-20 mb-12">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg">
                    <Star className="w-5 h-5 text-white fill-current" />
                    <span className="text-white font-bold text-sm">TRENDING</span>
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-gray-900">
                      High-Impact Research
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Most cited and viewed studies</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {popularResearch.slice(0, 3).map((research, index) => (
                    <div 
                      key={research._id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <ResearchCard research={research} />
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-12">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-navy-600 to-blue-600 rounded-full shadow-lg">
                    <Clock className="w-5 h-5 text-white" />
                    <span className="text-white font-bold text-sm">LATEST</span>
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-gray-900">
                      Recent Publications
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Newest additions to our repository</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recentResearch.map((research, index) => (
                    <div 
                      key={research._id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <ResearchCard 
                        research={research}
                        variant="compact"
                      />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Professional Healthcare CTA Section */}
          {!isAuthenticated && (
            <section className="mt-20 relative overflow-hidden rounded-3xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-navy-700 via-blue-700 to-indigo-700"></div>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '30px 30px'
                }}></div>
              </div>
              
              {/* Healthcare Icons Decoration */}
              <div className="absolute inset-0 overflow-hidden opacity-10">
                <Heart className="absolute top-10 left-10 w-20 h-20 text-white animate-pulse" />
                <Stethoscope className="absolute bottom-10 right-10 w-24 h-24 text-white animate-pulse animation-delay-1000" />
                <Activity className="absolute top-1/2 left-20 w-16 h-16 text-white animate-pulse animation-delay-500" />
              </div>

              <div className="relative p-12 md:p-16 text-center text-white">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-white bg-opacity-20 backdrop-blur-md rounded-2xl">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Join the Nursing Research Community
                </h2>
                <p className="text-xl text-blue-50 mb-3 max-w-2xl mx-auto font-light">
                  Collaborate with healthcare professionals and researchers worldwide
                </p>
                <p className="text-lg text-blue-100 mb-8 max-w-3xl mx-auto">
                  Access thousands of evidence-based nursing research papers, bookmark your favorites, contribute your own research, and be part of advancing healthcare through knowledge sharing
                </p>
                
                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto">
                  <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 border border-white border-opacity-20">
                    <BookOpen className="w-8 h-8 text-white mx-auto mb-2" />
                    <p className="text-sm font-medium">Unlimited Access</p>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 border border-white border-opacity-20">
                    <Award className="w-8 h-8 text-white mx-auto mb-2" />
                    <p className="text-sm font-medium">Peer Recognition</p>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 border border-white border-opacity-20">
                    <Shield className="w-8 h-8 text-white mx-auto mb-2" />
                    <p className="text-sm font-medium">Secure Platform</p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    to="/register"
                    className="group inline-flex items-center space-x-2 px-8 py-4 bg-white text-navy-700 hover:bg-blue-50 rounded-xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  >
                    <span>Create Free Account</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center space-x-2 px-8 py-4 bg-white bg-opacity-20 backdrop-blur-md hover:bg-opacity-30 rounded-xl font-semibold text-lg transition-all border-2 border-white border-opacity-40 hover:border-opacity-60 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  >
                    <span>Sign In</span>
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Healthcare Values Section */}
          <section className="mt-20 mb-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our Commitment to Excellence
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Supporting the nursing community through evidence-based research and collaborative learning
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all transform hover:-translate-y-1 border-t-4 border-navy-600">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-navy-100 rounded-2xl mb-4">
                  <Shield className="w-8 h-8 text-navy-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Assured</h3>
                <p className="text-gray-600 text-sm">
                  All research papers undergo rigorous peer review process
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all transform hover:-translate-y-1 border-t-4 border-blue-600">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Open Access</h3>
                <p className="text-gray-600 text-sm">
                  Free access to knowledge for all nursing professionals
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all transform hover:-translate-y-1 border-t-4 border-indigo-600">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Community Driven</h3>
                <p className="text-gray-600 text-sm">
                  Built by nurses, for nurses and healthcare professionals
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all transform hover:-translate-y-1 border-t-4 border-purple-600">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Recognition</h3>
                <p className="text-gray-600 text-sm">
                  Proper attribution and citation tracking for all contributors
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;