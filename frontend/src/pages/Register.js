// src/pages/Register.js - NAVY BLUE NURSING THEME
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingButton from '../components/LoadingButton';
import { Eye, EyeOff, Stethoscope, BookOpen, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentId: ''
  });

  const [studentIdVerification, setStudentIdVerification] = useState({
  status: 'idle', // idle | checking | verified | invalid
  message: ''
});
const [canProceed, setCanProceed] = useState(false);

  // Optimized particle animation - matching home page
  useEffect(() => {
    const canvas = document.getElementById('particle-canvas-register');
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

  if (!agreedToTerms) {
    toast.error('Please agree to the Terms and Privacy Policy');
    setShowTermsModal(true);
    return;
  }

  // ==========================================
  // NEW: CHECK STUDENT NUMBER VERIFICATION
  // ==========================================
  if (studentIdVerification.status !== 'verified') {
    toast.error('Please verify your student/faculty number first');
    return;
  }
  // ==========================================

  if (formData.password !== formData.confirmPassword) {
    toast.error('Passwords do not match!');
    return;
  }

  // ... rest of the submit logic stays the same

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
  const { name, value } = e.target;
  
  setFormData({
    ...formData,
    [name]: value
  });

// Verify student number in real-time
const verifyStudentNumber = async () => {
  if (!formData.studentId.trim()) {
    toast.error('Please enter your student/faculty number');
    return;
  }

  setStudentIdVerification({ status: 'checking', message: 'Verifying...' });

  try {
    const { data } = await api.post('/verification/check-number', {
      studentNumber: formData.studentId
    });

    if (data.isAuthorized) {
      setStudentIdVerification({ 
        status: 'verified', 
        message: '✓ Number verified! You can proceed with registration.' 
      });
      setCanProceed(true);
      toast.success('Student number verified!');
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Verification failed';
    setStudentIdVerification({ 
      status: 'invalid', 
      message: `✗ ${message}` 
    });
    setCanProceed(false);
    toast.error(message);
  }
};

  // Reset verification when student ID changes
  if (name === 'studentId') {
    setStudentIdVerification({ status: 'idle', message: '' });
    setCanProceed(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Particle Canvas */}
      <canvas 
        id="particle-canvas-register" 
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
        <div className="max-w-2xl w-full">
          {/* Logo and Title Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-navy-700 to-blue-900 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-3 tracking-tight">
              <span className="bg-gradient-to-r from-navy-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Join ConServe
              </span>
            </h1>
            <p className="text-xl text-gray-600">Create your account today</p>
            <p className="text-sm text-gray-500 mt-2">NEUST College of Nursing Research Repository</p>
          </div>

          {/* Register Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 animate-fade-in-up animation-delay-200">
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Member</option>
                  </select>
                </div>

              <div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    {formData.role === 'student' ? 'Student Number' : 'Faculty Number'} *
  </label>
  <div className="space-y-2">
    <div className="flex gap-2">
      <input
        type="text"
        name="studentId"
        value={formData.studentId}
        onChange={handleChange}
        className={`flex-1 px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all ${
          studentIdVerification.status === 'verified' 
            ? 'border-green-500 bg-green-50' 
            : studentIdVerification.status === 'invalid'
            ? 'border-red-500 bg-red-50'
            : 'border-gray-200'
        }`}
        placeholder="2024-12345"
        required
        disabled={studentIdVerification.status === 'verified'}
      />
      <button
        type="button"
        onClick={verifyStudentNumber}
        disabled={studentIdVerification.status === 'checking' || studentIdVerification.status === 'verified'}
        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
          studentIdVerification.status === 'verified'
            ? 'bg-green-600 text-white cursor-not-allowed'
            : 'bg-navy-700 text-white hover:bg-navy-800'
        }`}
      >
        {studentIdVerification.status === 'checking' && '⏳'}
        {studentIdVerification.status === 'verified' && '✓'}
        {(studentIdVerification.status === 'idle' || studentIdVerification.status === 'invalid') && 'Verify'}
      </button>
    </div>

    {/* Verification Status Messages */}
    {studentIdVerification.status === 'checking' && (
      <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
        <div className="spinner-small"></div>
        <span>{studentIdVerification.message}</span>
      </div>
    )}

    {studentIdVerification.status === 'verified' && (
      <div className="flex items-center space-x-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
        <CheckCircle className="w-4 h-4" />
        <span className="font-medium">{studentIdVerification.message}</span>
      </div>
    )}

    {studentIdVerification.status === 'invalid' && (
      <div className="flex items-start space-x-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">{studentIdVerification.message}</p>
          <p className="text-xs mt-1">Contact your administrator to get authorized.</p>
        </div>
      </div>
    )}

    {studentIdVerification.status === 'idle' && (
      <div className="flex items-start space-x-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">⚠️ Verification Required</p>
          <p className="text-xs mt-1">You must verify your student/faculty number before registering.</p>
        </div>
      </div>
    )}
  </div>
</div>
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
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                      placeholder="Min 6 characters"
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
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
  disabled={!agreedToTerms || !canProceed}
  className="w-full bg-gradient-to-r from-navy-700 to-blue-800 hover:from-navy-800 hover:to-blue-900 text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
>
  Create Account
</LoadingButton>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-navy-700 font-semibold hover:text-navy-800 hover:underline transition-colors"
              >
                Login here
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
          <div className="mt-8 grid grid-cols-4 gap-3 animate-fade-in-up animation-delay-600">
            <div className="text-center bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-3 border border-gray-100">
              <BookOpen className="w-6 h-6 text-navy-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 font-medium">Research</p>
            </div>
            <div className="text-center bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-3 border border-gray-100">
              <Stethoscope className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 font-medium">Healthcare</p>
            </div>
            <div className="text-center bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-3 border border-gray-100">
              <Shield className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 font-medium">Secure</p>
            </div>
            <div className="text-center bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-3 border border-gray-100">
              <div className="w-6 h-6 mx-auto mb-1 flex items-center justify-center">
                <span className="text-purple-600 text-xl">🎓</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Excellence</p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 my-8 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Registration Terms & Conditions
                </h2>
                <p className="text-sm text-gray-600">ConServe - NEUST College of Nursing</p>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 text-gray-700">
              <section className="bg-navy-50 rounded-xl p-4 border-l-4 border-navy-600">
                <h3 className="text-xl font-bold text-navy-900 mb-3">
                  Terms of Service for Account Registration
                </h3>
                <p className="mb-4">
                  By creating an account on ConServe, you agree to the following terms:
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 text-sm mr-2">1</span>
                  Account Eligibility
                </h4>
                <p className="ml-8">
                  You must be a student, faculty member, or staff of NEUST College of Nursing to create an account. You agree to provide accurate and complete information during registration.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 text-sm mr-2">2</span>
                  Account Security
                </h4>
                <p className="ml-8">
                  You are responsible for maintaining the confidentiality of your password and account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 text-sm mr-2">3</span>
                  User Conduct
                </h4>
                <p className="ml-8">
                  You agree to use ConServe only for lawful purposes. You will not upload malicious content, harass other users, or violate any intellectual property rights.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 text-sm mr-2">4</span>
                  Privacy Policy
                </h4>
                <p className="ml-8">
                  Your personal information will be handled according to our Privacy Policy. We collect and store your name, email, role, and activity data to provide our services.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 text-sm mr-2">5</span>
                  Content Ownership
                </h4>
                <p className="ml-8">
                  You retain all rights to research you submit. By using ConServe, you grant us a license to display and distribute your content within the platform.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 text-sm mr-2">6</span>
                  Account Termination
                </h4>
                <p className="ml-8">
                  We reserve the right to suspend or terminate accounts that violate these terms or engage in prohibited activities.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 text-sm mr-2">7</span>
                  Data Collection
                </h4>
                <p className="ml-8">
                  We collect usage data, bookmarks, and submission history to improve our services. This data may be used for analytics but will not be shared with third parties.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 text-sm mr-2">8</span>
                  Changes to Terms
                </h4>
                <p className="ml-8">
                  We may update these terms at any time. Continued use of ConServe after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="w-6 h-6 bg-navy-100 rounded-full flex items-center justify-center text-navy-700 text-sm mr-2">9</span>
                  Contact
                </h4>
                <p className="ml-8">
                  For questions about these terms, contact us at NEUST College of Nursing, Cabanatuan City, Nueva Ecija.
                </p>
              </section>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mt-6">
                <p className="text-sm text-gray-700">
                  <strong>Important:</strong> By clicking "I Agree" below, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setShowTermsModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium text-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTermsModal(false);
                  toast.success('Thank you for agreeing to the terms');
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-navy-700 to-blue-800 text-white rounded-xl hover:from-navy-800 hover:to-blue-900 transition font-medium shadow-lg"
              >
                I Agree to Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;