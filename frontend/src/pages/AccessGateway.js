// frontend/src/pages/AccessGateway.js - NEW FILE
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, Shield, BookOpen, Users, ArrowRight, CheckCircle, FileText } from 'lucide-react';

const AccessGateway = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const researchId = location.state?.researchId;

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Particle animation (same as login/register)
  useEffect(() => {
    const canvas = document.getElementById('gateway-particle-canvas');
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
    return () => window.removeEventListener('resize', handleResize);
  }, [mousePosition]);

  const handleLogin = () => {
    navigate('/login', { state: { from: 'access-gateway', researchId } });
  };

  const handleRegister = () => {
    navigate('/register', { state: { from: 'access-gateway', researchId } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Particle Canvas */}
      <canvas 
        id="gateway-particle-canvas" 
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.3 }}
      />

      {/* Medical Cross Pattern Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231e3a8a' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Animated Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-16">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-navy-700 to-blue-900 rounded-3xl flex items-center justify-center shadow-2xl">
                <Lock className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-navy-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Access Required
              </span>
            </h1>
            <p className="text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              To view full research papers, please login or create an account
            </p>
            <p className="text-sm text-gray-500 mt-3">
              Authorized access for NEUST College of Nursing students and faculty
            </p>
          </div>

          {/* Access Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 animate-fade-in-up animation-delay-200">
            {/* Login Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-navy-200 hover:border-navy-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-navy-100 rounded-2xl mb-4">
                  <Shield className="w-8 h-8 text-navy-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Already Have an Account?
                </h2>
                <p className="text-gray-600">
                  Login to access full research papers
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  'Access to complete research papers',
                  'Secure PDF viewer with watermarks',
                  'Bookmark favorite research',
                  'Track your reading history'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-navy-700 to-blue-800 text-white rounded-xl hover:from-navy-800 hover:to-blue-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
              >
                <span>Login Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Register Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                  <Users className="w-8 h-8 text-blue-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  New to ConServe?
                </h2>
                <p className="text-gray-600">
                  Create your account to get started
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  'Free registration for authorized users',
                  'Student/Faculty number verification',
                  'Submit your own research',
                  'Join the nursing community'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleRegister}
                className="w-full flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
              >
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Features Banner */}
          <div className="bg-gradient-to-r from-navy-700 via-blue-700 to-indigo-700 rounded-3xl p-8 text-white text-center shadow-2xl animate-fade-in-up animation-delay-400">
            <div className="flex items-center justify-center mb-4">
              <FileText className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Why Access Full Research?</h3>
            <p className="text-blue-100 max-w-2xl mx-auto mb-6">
              Access complete research papers with advanced security features including watermarking, 
              secure viewing, and full academic citations for your studies.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4">
                <Shield className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Secure Access</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4">
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Complete Papers</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Verified Community</p>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center animate-fade-in-up animation-delay-600">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-navy-700 transition-colors inline-flex items-center group font-medium"
            >
              <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span>
              Back to Browse Research
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessGateway;