// src/pages/Login.js - NAVY BLUE NURSING THEME
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingButton from '../components/LoadingButton';
import { Eye, EyeOff, Stethoscope, BookOpen } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Optimized particle animation - matching home page
  useEffect(() => {
    const canvas = document.getElementById('particle-canvas');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Particle Canvas */}
      <canvas 
        id="particle-canvas" 
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
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-16">
        <div className="max-w-md w-full">
          {/* Logo and Title Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-navy-700 to-blue-900 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <Stethoscope className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-3 tracking-tight">
              <span className="bg-gradient-to-r from-navy-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Welcome Back
              </span>
            </h1>
            <p className="text-xl text-gray-600">Login to ConServe</p>
            <p className="text-sm text-gray-500 mt-2">NEUST College of Nursing Research Repository</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 animate-fade-in-up animation-delay-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-navy-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <LoadingButton
                type="submit"
                loading={loading}
                className="w-full bg-gradient-to-r from-navy-700 to-blue-800 hover:from-navy-800 hover:to-blue-900 text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                Login to ConServe
              </LoadingButton>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-navy-700 font-semibold hover:text-navy-800 hover:underline transition-colors"
              >
                Register here
              </Link>
            </div>
          </div>

          {/* Back to Home Link */}
          <div className="mt-6 text-center animate-fade-in-up animation-delay-400">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-navy-700 transition-colors inline-flex items-center group font-medium"
            >
              <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span>
              Back to Home
            </Link>
          </div>

          {/* Healthcare Values */}
          <div className="mt-8 grid grid-cols-3 gap-4 animate-fade-in-up animation-delay-600">
            <div className="text-center bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-3 border border-gray-100">
              <BookOpen className="w-6 h-6 text-navy-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 font-medium">Research</p>
            </div>
            <div className="text-center bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-3 border border-gray-100">
              <Stethoscope className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 font-medium">Healthcare</p>
            </div>
            <div className="text-center bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-3 border border-gray-100">
              <div className="w-6 h-6 mx-auto mb-1 flex items-center justify-center">
                <span className="text-indigo-600 text-xl">🎓</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Excellence</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;