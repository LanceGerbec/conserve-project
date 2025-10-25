import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, AlertTriangle, Shield, Users, Upload, Lock, Scale, Ban, RefreshCw, Mail, Heart, Stethoscope, BookOpen } from 'lucide-react';

const Terms = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState(null);
  const [accepted, setAccepted] = useState(false);

  // Particle animation
  useEffect(() => {
    const canvas = document.getElementById('terms-particle-canvas');
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

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const sections = [
    {
      id: 1,
      icon: CheckCircle,
      title: 'Acceptance of Terms',
      color: 'from-navy-600 to-blue-700',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            By accessing and using ConServe (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use this Service.
          </p>
          <div className="bg-gradient-to-r from-navy-50 to-blue-50 p-5 rounded-xl border-l-4 border-navy-600">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-navy-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Important</h4>
                <p className="text-gray-700 text-sm">
                  Your continued use of the Service constitutes acceptance of these terms and any future modifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      icon: Users,
      title: 'User Accounts',
      color: 'from-blue-600 to-indigo-700',
      content: (
        <>
          <p className="text-gray-700 leading-relaxed mb-4">
            To access certain features of the Service, you must register for an account. When you register, you agree to:
          </p>
          <div className="space-y-3">
            {[
              'Provide accurate and complete information',
              'Maintain the security of your password',
              'Be responsible for all activities under your account',
              'Notify us immediately of any unauthorized use',
              'Update your information to keep it current',
              'Not share your account credentials with others'
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3 bg-indigo-50 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </>
      )
    },
    {
      id: 3,
      icon: Upload,
      title: 'Research Submission',
      color: 'from-indigo-600 to-purple-700',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            When submitting research papers, you represent that you have the right to submit the content and grant ConServe the license to display, distribute, and archive your research. All submissions are subject to review and approval by administrators.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-600">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Required</p>
                  <p className="text-gray-700 text-sm">Original research work, proper citations, accurate metadata</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-600">
              <div className="flex items-start space-x-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Prohibited</p>
                  <p className="text-gray-700 text-sm">Plagiarized content, false information, copyrighted material</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      icon: BookOpen,
      title: 'Intellectual Property',
      color: 'from-purple-600 to-pink-700',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            All research papers remain the intellectual property of their respective authors. ConServe serves only as a repository and does not claim ownership of submitted content. Users must respect copyright and properly cite all sources.
          </p>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl border-l-4 border-purple-600">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Copyright Protection</h4>
                <p className="text-gray-700 text-sm">
                  By submitting research, you grant ConServe a non-exclusive license to display and distribute your work while maintaining your copyright ownership.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      icon: Ban,
      title: 'Acceptable Use',
      color: 'from-pink-600 to-red-700',
      content: (
        <>
          <p className="text-gray-700 leading-relaxed mb-4">
            You agree not to:
          </p>
          <div className="space-y-3">
            {[
              'Upload malicious content or viruses',
              'Attempt to gain unauthorized access to the system',
              'Harass, abuse, or harm other users',
              'Submit false, misleading, or plagiarized content',
              'Use the Service for any illegal purposes',
              'Interfere with the proper functioning of the Service',
              'Collect user data without consent',
              'Impersonate other users or administrators'
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3 bg-red-50 p-3 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </>
      )
    },
    {
      id: 6,
      icon: RefreshCw,
      title: 'Termination',
      color: 'from-orange-600 to-red-700',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or the Service.
          </p>
          <div className="bg-orange-50 p-5 rounded-xl border-l-4 border-orange-600">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Account Suspension</h4>
                <p className="text-gray-700 text-sm">
                  Violations of these terms may result in immediate account suspension or termination. Repeated violations will result in permanent ban from the Service.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 7,
      icon: AlertTriangle,
      title: 'Disclaimer',
      color: 'from-yellow-600 to-orange-700',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            The Service is provided "as is" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, secure, or error-free. Research content is provided by users and we are not responsible for its accuracy or completeness.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 p-4 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">No Warranty</h4>
              <p className="text-gray-700 text-sm">Service provided without guarantees of availability or accuracy</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">User Content</h4>
              <p className="text-gray-700 text-sm">We are not liable for user-submitted research content</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 8,
      icon: Scale,
      title: 'Changes to Terms',
      color: 'from-green-600 to-teal-700',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to modify these terms at any time. We will notify users of any material changes. Your continued use of the Service after such modifications constitutes acceptance of the updated terms.
          </p>
          <div className="bg-green-50 p-5 rounded-xl border-l-4 border-green-600">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Stay Informed</h4>
                <p className="text-gray-700 text-sm">
                  We will notify you via email of any significant changes to these terms. Please review the terms periodically.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 9,
      icon: Mail,
      title: 'Contact Information',
      color: 'from-blue-600 to-navy-700',
      content: (
        <div className="bg-gradient-to-br from-navy-50 to-blue-50 p-6 rounded-xl border border-navy-200">
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have any questions about these Terms, please contact us at:
          </p>
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-gray-900 text-lg mb-2">
                NEUST College of Nursing
              </p>
              <p className="text-gray-700">Cabanatuan City, Nueva Ecija, Philippines</p>
            </div>
            <div className="flex items-center space-x-2 text-navy-700 bg-white p-3 rounded-lg">
              <Mail className="w-5 h-5" />
              <span className="font-medium">legal@conserve.neust.edu.ph</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Particle Canvas */}
      <canvas 
        id="terms-particle-canvas" 
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
      <div className="relative z-10 py-16">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-navy-700 to-blue-900 rounded-3xl flex items-center justify-center shadow-2xl">
                <FileText className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-navy-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Terms & Conditions
              </span>
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              Please read these terms carefully before using ConServe
            </p>
            <p className="text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Agreement Banner */}
          <div className="mb-12 animate-fade-in-up animation-delay-200">
            <div className="bg-gradient-to-r from-navy-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-start space-x-4">
                <Scale className="w-8 h-8 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Legal Agreement</h3>
                  <p className="text-blue-100 mb-4">
                    By using ConServe, you agree to be bound by these Terms and Conditions. This is a legally binding agreement between you and NEUST College of Nursing.
                  </p>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-white cursor-pointer"
                    />
                    <span className="font-medium">I have read and accept these Terms and Conditions</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 animate-fade-in-up animation-delay-300">
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-600 hover:shadow-lg transition-all">
              <div className="flex items-center space-x-3 mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-gray-900">Your Rights</h3>
              </div>
              <p className="text-gray-600 text-sm">Access, submit, and bookmark research papers freely</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-orange-600 hover:shadow-lg transition-all">
              <div className="flex items-center space-x-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <h3 className="font-bold text-gray-900">Your Responsibilities</h3>
              </div>
              <p className="text-gray-600 text-sm">Use the service ethically and legally</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-600 hover:shadow-lg transition-all">
              <div className="flex items-center space-x-3 mb-2">
                <XCircle className="w-6 h-6 text-red-600" />
                <h3 className="font-bold text-gray-900">Prohibited Actions</h3>
              </div>
              <p className="text-gray-600 text-sm">No plagiarism, abuse, or illegal activities</p>
            </div>
          </div>

          {/* Terms Sections */}
          <div className="space-y-6 animate-fade-in-up animation-delay-400">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <div 
                  key={section.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <button
                    onClick={() => setActiveSection(isActive ? null : section.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 bg-gradient-to-br ${section.color} rounded-xl shadow-md`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {section.id}. {section.title}
                        </h2>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-navy-600 rotate-180' : 'bg-gray-200'}`}>
                      <svg className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {isActive && (
                    <div className="px-6 pb-6 pt-2 border-t-2 border-gray-100 animate-fade-in">
                      {section.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Healthcare CTA */}
          <div className="mt-16 relative overflow-hidden rounded-3xl shadow-2xl animate-fade-in-up animation-delay-600">
            <div className="absolute inset-0 bg-gradient-to-r from-navy-700 via-blue-700 to-indigo-700"></div>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}></div>
            </div>

            <div className="absolute inset-0 overflow-hidden opacity-10">
              <Heart className="absolute top-10 left-10 w-20 h-20 text-white animate-pulse" />
              <Stethoscope className="absolute bottom-10 right-10 w-24 h-24 text-white animate-pulse animation-delay-1000" />
            </div>

            <div className="relative p-12 text-center text-white">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 backdrop-blur-md rounded-2xl mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Questions About These Terms?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                We're here to help clarify any concerns
              </p>
              <div className="inline-flex items-center space-x-2 px-8 py-4 bg-white bg-opacity-20 backdrop-blur-md rounded-xl border-2 border-white border-opacity-30">
                <Mail className="w-5 h-5" />
                <span className="font-semibold text-lg">legal@conserve.neust.edu.ph</span>
              </div>
            </div>
          </div>

          {/* Acceptance Footer */}
          {accepted && (
            <div className="mt-8 bg-green-50 border-2 border-green-600 rounded-2xl p-6 animate-fade-in">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Terms Accepted</h3>
                  <p className="text-gray-700">Thank you for accepting our Terms and Conditions. You may now use ConServe.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Terms;