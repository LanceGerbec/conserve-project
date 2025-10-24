// src/pages/Register.js - With Terms Agreement
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingButton from '../components/LoadingButton';
import { Eye, EyeOff, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentId: ''
  });

  // Particle animation effect
  useEffect(() => {
    const canvas = document.getElementById('particle-canvas-register');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 60;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = Math.random() > 0.5 ? 'rgba(255, 154, 53, ' : 'rgba(0, 61, 143, ';
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
        ctx.fillStyle = this.color + this.opacity + ')';
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

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = `rgba(255, 154, 53, ${0.15 * (1 - distance / 100)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms and Privacy Policy');
      setShowTermsModal(true);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        studentId: formData.role === 'student' ? formData.studentId : undefined
      });
      
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Particle Background */}
      <canvas 
        id="particle-canvas-register" 
        className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900"
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-16">
        <div className="max-w-2xl w-full mb-16">
          {/* Logo and Title Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-apricot-400 to-apricot-600 rounded-3xl flex items-center justify-center text-white font-bold text-4xl shadow-2xl transform hover:scale-110 transition-transform duration-300 hover:rotate-6">
                C
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
              Create Account
            </h1>
            <p className="text-xl text-gray-300">Join ConServe today</p>
          </div>

          {/* Register Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 transform hover:scale-[1.01] transition-transform duration-300">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-apricot-500 focus:border-transparent transition-all"
                    placeholder="Juan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-apricot-500 focus:border-transparent transition-all"
                    placeholder="Dela Cruz"
                    required
                  />
                </div>
              </div>

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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-apricot-500 focus:border-transparent transition-all"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              {/* Role and Student ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    I am a...
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-apricot-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Member</option>
                  </select>
                </div>

                {formData.role === 'student' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Student ID
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-apricot-500 focus:border-transparent transition-all"
                      placeholder="2024-12345"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-apricot-500 focus:border-transparent transition-all"
                      placeholder="Min 6 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-apricot-500 focus:border-transparent transition-all"
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="bg-navy-50 rounded-xl p-4 border-2 border-navy-200">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="register-terms-checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 mr-3 w-5 h-5 text-navy-700 border-gray-300 rounded focus:ring-navy-500"
                    required
                  />
                  <label htmlFor="register-terms-checkbox" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-navy-700 font-semibold hover:underline"
                    >
                      Terms and Conditions
                    </button>{' '}
                    and{' '}
                    <Link
                      to="/privacy"
                      target="_blank"
                      className="text-navy-700 font-semibold hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    . *
                  </label>
                </div>
                {!agreedToTerms && (
                  <p className="text-xs text-red-600 mt-2 ml-8 font-medium">
                    * You must agree to the terms to create an account
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <LoadingButton
                type="submit"
                loading={loading}
                disabled={!agreedToTerms}
                className="w-full bg-gradient-to-r from-navy-700 to-navy-900 hover:from-navy-800 hover:to-navy-950 text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Create Account
              </LoadingButton>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-apricot-600 font-semibold hover:text-apricot-700 hover:underline transition-colors"
              >
                Login here
              </Link>
            </div>
          </div>

          {/* Back to Home Link */}
          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white transition-colors inline-flex items-center group"
            >
              <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 my-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Registration Terms & Conditions
              </h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 text-gray-700">
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Terms of Service for Account Registration
                </h3>
                <p className="mb-4">
                  By creating an account on ConServe, you agree to the following terms:
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">1. Account Eligibility</h4>
                <p>
                  You must be a student, faculty member, or staff of NEUST College of Nursing to create an account. You agree to provide accurate and complete information during registration.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">2. Account Security</h4>
                <p>
                  You are responsible for maintaining the confidentiality of your password and account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">3. User Conduct</h4>
                <p>
                  You agree to use ConServe only for lawful purposes. You will not upload malicious content, harass other users, or violate any intellectual property rights.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">4. Privacy Policy</h4>
                <p>
                  Your personal information will be handled according to our Privacy Policy. We collect and store your name, email, role, and activity data to provide our services.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">5. Content Ownership</h4>
                <p>
                  You retain all rights to research you submit. By using ConServe, you grant us a license to display and distribute your content within the platform.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">6. Account Termination</h4>
                <p>
                  We reserve the right to suspend or terminate accounts that violate these terms or engage in prohibited activities.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">7. Data Collection</h4>
                <p>
                  We collect usage data, bookmarks, and submission history to improve our services. This data may be used for analytics but will not be shared with third parties.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">8. Changes to Terms</h4>
                <p>
                  We may update these terms at any time. Continued use of ConServe after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">9. Contact</h4>
                <p>
                  For questions about these terms, contact us at NEUST College of Nursing, Cabanatuan City, Nueva Ecija.
                </p>
              </section>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setShowTermsModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTermsModal(false);
                  toast.success('Thank you for agreeing to the terms');
                }}
                className="flex-1 px-6 py-3 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition font-medium"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;