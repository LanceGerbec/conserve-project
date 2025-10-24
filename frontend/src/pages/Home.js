// src/pages/Home.js - WITH PARTICLES
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp, Clock } from 'lucide-react';
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
  const [filters, setFilters] = useState({
    search: '',
    subjectArea: '',
    year: '',
    sort: 'recent'
  });

  // Particle animation effect
  useEffect(() => {
    const canvas = document.getElementById('home-particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 40;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.3 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = `rgba(255, 154, 53, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
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
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Particle Canvas */}
      <canvas 
        id="home-particle-canvas" 
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.4 }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section with Centered Search */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 text-white py-24 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h1 className="text-6xl font-bold mb-4 animate-fade-in">
                Welcome to ConServe
              </h1>
              <p className="text-2xl text-gray-200 mb-2">
                NEUST College of Nursing Research Repository
              </p>
              <p className="text-lg text-gray-300">
                Discover, explore, and contribute to nursing research
              </p>
            </div>

            {/* Centered Search Bar */}
            <div className="flex justify-center mb-8">
              <SearchBar 
                onSearch={handleSearch} 
                placeholder="Search by title, author, or keywords..."
              />
            </div>

            {/* Submit Button */}
            {isAuthenticated && (
              <div className="text-center">
                <Link
                  to="/submit"
                  className="inline-block px-8 py-4 bg-apricot-500 hover:bg-apricot-600 rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl"
                >
                  📤 Submit Your Research
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
              <BookOpen className="w-12 h-12 text-navy-600 mx-auto mb-3" />
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {researches.length}
              </h3>
              <p className="text-gray-600">Total Research Papers</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
              <TrendingUp className="w-12 h-12 text-apricot-500 mx-auto mb-3" />
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {popularResearch.length}
              </h3>
              <p className="text-gray-600">Popular This Month</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
              <Clock className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {recentResearch.length}
              </h3>
              <p className="text-gray-600">Recent Uploads</p>
            </div>
          </div>

          {/* Filter & Research Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <FilterPanel 
                onFilterChange={handleFilterChange}
                initialFilters={filters}
              />
            </div>

            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="spinner"></div>
                </div>
              ) : researches.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-md">
                  <p className="text-xl text-gray-600 mb-4">
                    🔭 No research papers found
                  </p>
                  <button
                    onClick={() => setFilters({ search: '', subjectArea: '', year: '', sort: 'recent' })}
                    className="text-navy-700 hover:text-navy-800 font-semibold underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-gray-600 font-medium">
                    📚 Found {researches.length} research paper{researches.length !== 1 ? 's' : ''}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {researches.map((research) => (
                      <ResearchCard key={research._id} research={research} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Featured Sections */}
          {!filters.search && !filters.subjectArea && !filters.year && (
            <>
              <section className="mt-16 mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  🔥 Popular Research
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {popularResearch.slice(0, 3).map((research) => (
                    <ResearchCard key={research._id} research={research} />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  🆕 Recent Research
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recentResearch.map((research) => (
                    <ResearchCard 
                      key={research._id} 
                      research={research}
                      variant="compact"
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {/* CTA Section */}
          {!isAuthenticated && (
            <section className="mt-16 bg-gradient-to-r from-navy-700 to-navy-900 rounded-2xl p-12 text-center text-white shadow-2xl">
              <h2 className="text-3xl font-bold mb-4">
                Join ConServe Today
              </h2>
              <p className="text-xl text-gray-200 mb-8">
                Access thousands of nursing research papers and contribute your own
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  to="/register"
                  className="px-8 py-3 bg-apricot-500 hover:bg-apricot-600 rounded-lg font-semibold transition shadow-lg"
                >
                  Register Now
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-white text-navy-900 hover:bg-gray-100 rounded-lg font-semibold transition shadow-lg"
                >
                  Login
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;