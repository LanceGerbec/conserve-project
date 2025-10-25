import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, Database, UserCheck, Bell, FileText, Mail, Heart, Stethoscope, CheckCircle, AlertCircle, Globe } from 'lucide-react';

const Privacy = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState(null);

  // Particle animation
  useEffect(() => {
    const canvas = document.getElementById('privacy-particle-canvas');
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
      icon: Database,
      title: 'Information We Collect',
      color: 'from-navy-600 to-blue-700',
      content: (
        <>
          <p className="text-gray-700 leading-relaxed mb-4">
            In compliance with the Data Privacy Act of 2012 (Republic Act No. 10173), we collect the following personal information:
          </p>
          <div className="space-y-3">
            {[
              'Name, email address, and student/faculty ID',
              'Research papers and associated metadata (titles, abstracts, keywords)',
              'Account credentials (encrypted and secured)',
              'Usage data and analytics for service improvement',
              'IP addresses for security purposes'
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3 bg-blue-50 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5 text-navy-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-50 p-4 rounded-xl border-l-4 border-blue-600">
            <p className="text-gray-700 text-sm">
              <strong>Legal Basis:</strong> Collection is based on your consent and our legitimate interest in providing educational services under RA 10173.
            </p>
          </div>
        </>
      )
    },
    {
      id: 2,
      icon: Eye,
      title: 'How We Use Your Information',
      color: 'from-blue-600 to-indigo-700',
      content: (
        <>
          <p className="text-gray-700 leading-relaxed mb-4">
            In accordance with the principles of transparency, legitimate purpose, and proportionality under the DPA, we use collected information for:
          </p>
          <div className="space-y-3">
            {[
              'Providing and maintaining the ConServe research repository',
              'Processing research submissions and peer reviews',
              'Sending notifications about submission status and updates',
              'Improving our services and user experience',
              'Ensuring security, preventing fraud, and protecting users',
              'Complying with legal obligations under Philippine law'
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
      icon: Lock,
      title: 'Data Security (RA 10173 Compliance)',
      color: 'from-indigo-600 to-purple-700',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-xl border-l-4 border-indigo-600">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Security Measures Under DPA</h4>
                <p className="text-gray-700 leading-relaxed mb-3">
                  As required by the Data Privacy Act and National Privacy Commission (NPC) regulations, we implement:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Organizational security measures (access controls, employee training)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Technical security measures (encryption, secure protocols, firewalls)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Physical security measures (secure server locations)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Regular security audits and vulnerability assessments</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-600">
            <p className="text-gray-700 text-sm">
              <strong>Data Breach Protocol:</strong> In the event of a data breach, we will notify affected individuals and the National Privacy Commission within 72 hours as mandated by law.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      icon: Globe,
      title: 'Data Sharing and Disclosure',
      color: 'from-purple-600 to-pink-700',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl border-l-4 border-purple-600">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Your Privacy First</h4>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Public Research:</strong> Approved research papers become publicly accessible for academic purposes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Legal Requirements:</strong> When required by Philippine law or court order</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>With Your Consent:</strong> When you explicitly authorize sharing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Institutional Partners:</strong> NEUST administration for academic verification (with safeguards)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      icon: UserCheck,
      title: 'Your Rights Under the Data Privacy Act',
      color: 'from-pink-600 to-red-700',
      content: (
        <>
          <p className="text-gray-700 leading-relaxed mb-4">
            Under Republic Act No. 10173 (Data Privacy Act of 2012), you have the following rights:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Right to be informed about data collection',
              'Right to access your personal data',
              'Right to object to data processing',
              'Right to erasure or blocking of data',
              'Right to rectify inaccurate data',
              'Right to data portability',
              'Right to file a complaint with NPC',
              'Right to damages for violations'
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3 bg-pink-50 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-gradient-to-r from-pink-50 to-red-50 p-4 rounded-xl border-l-4 border-pink-600">
            <p className="text-gray-700 text-sm">
              <strong>Exercise Your Rights:</strong> Contact our Data Protection Officer at privacy@conserve.neust.edu.ph to exercise any of these rights. We will respond within 15 days as required by NPC regulations.
            </p>
          </div>
        </>
      )
    },
    {
      id: 6,
      icon: Bell,
      title: 'Cookies and Tracking Technologies',
      color: 'from-orange-600 to-red-700',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700 leading-relaxed">
            We use cookies and local storage technologies to enhance your experience. Under the Data Privacy Act, we inform you about:
          </p>
          <div className="space-y-3">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-2">Essential Cookies</h5>
              <p className="text-gray-700 text-sm">Required for login sessions and security features. Cannot be disabled.</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h5>
              <p className="text-gray-700 text-sm">Help us understand usage patterns to improve services. Can be controlled via browser settings.</p>
            </div>
          </div>
          <p className="text-gray-700 text-sm italic">
            You can manage cookie preferences through your browser settings. Disabling essential cookies may affect functionality.
          </p>
        </div>
      )
    },
    {
      id: 7,
      icon: Database,
      title: 'Data Retention and Storage',
      color: 'from-green-600 to-teal-700',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700 leading-relaxed">
            In compliance with NPC Circular No. 16-03 on data retention:
          </p>
          <div className="space-y-3">
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
              <h5 className="font-semibold text-gray-900 mb-2">Personal Data</h5>
              <p className="text-gray-700 text-sm">Retained while your account is active or as needed to provide services. You may request deletion at any time.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
              <h5 className="font-semibold text-gray-900 mb-2">Research Papers</h5>
              <p className="text-gray-700 text-sm">Retained indefinitely as part of the academic repository unless you request removal or if required by law.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
              <h5 className="font-semibold text-gray-900 mb-2">Server Location</h5>
              <p className="text-gray-700 text-sm">Data is stored on secure servers in the Philippines, ensuring compliance with local data residency requirements.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 8,
      icon: Shield,
      title: "Children's Privacy and Parental Consent",
      color: 'from-teal-600 to-cyan-700',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700 leading-relaxed">
            Our Service is intended for students and faculty of NEUST College of Nursing. In accordance with the Data Privacy Act:
          </p>
          <div className="bg-cyan-50 p-4 rounded-lg border-l-4 border-cyan-600">
            <p className="text-gray-700 mb-2">
              We do not knowingly collect information from individuals under 18 years old without verifiable parental or guardian consent.
            </p>
            <p className="text-gray-700 text-sm">
              If we become aware of collection from minors without proper consent, we will take immediate steps to delete that information and notify the parent or guardian.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 9,
      icon: FileText,
      title: 'Changes to Privacy Policy',
      color: 'from-cyan-600 to-blue-700',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy to reflect changes in our practices or legal requirements. Material changes will be communicated through:
          </p>
          <div className="space-y-2">
            {[
              'Email notification to registered users',
              'Prominent notice on the platform',
              'Updated "Last Modified" date on this page'
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3 bg-cyan-50 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-cyan-50 p-4 rounded-xl border-l-4 border-cyan-600">
            <p className="text-gray-700 text-sm">
              Your continued use of the Service after changes constitutes acceptance of the updated policy. You may withdraw consent by closing your account.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 10,
      icon: Mail,
      title: 'Contact Our Data Protection Officer',
      color: 'from-blue-600 to-navy-700',
      content: (
        <div className="bg-gradient-to-br from-navy-50 to-blue-50 p-6 rounded-xl border border-navy-200">
          <p className="text-gray-700 leading-relaxed mb-4">
            For questions, concerns, or to exercise your rights under the Data Privacy Act of 2012, please contact:
          </p>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg">
              <p className="font-semibold text-gray-900 text-lg mb-1">
                NEUST ConServe Data Protection Officer
              </p>
              <div className="flex items-center space-x-2 text-navy-700 mb-1">
                <Mail className="w-5 h-5" />
                <span className="font-medium">privacy@conserve.neust.edu.ph</span>
              </div>
              <p className="text-gray-600 text-sm">Response time: Within 15 days as per NPC regulations</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="font-semibold text-gray-900 mb-1">National Privacy Commission</p>
              <p className="text-gray-700 text-sm">If your concerns are not addressed, you may file a complaint with:</p>
              <p className="text-navy-700 font-medium text-sm mt-2">
                National Privacy Commission<br/>
                Website: privacy.gov.ph<br/>
                Email: info@privacy.gov.ph
              </p>
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
        id="privacy-particle-canvas" 
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
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-navy-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Privacy Policy
              </span>
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              Your privacy and data security are our top priorities
            </p>
            <p className="text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 animate-fade-in-up animation-delay-200">
            <div className="bg-white rounded-xl shadow-md p-4 text-center border border-gray-100 hover:shadow-lg transition-all">
              <Shield className="w-8 h-8 text-navy-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-sm">Secure & Encrypted</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center border border-gray-100 hover:shadow-lg transition-all">
              <Lock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-sm">DPA Compliant</p>
              <p className="text-xs text-gray-600 mt-1">RA 10173</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center border border-gray-100 hover:shadow-lg transition-all">
              <UserCheck className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 text-sm">Your Rights Protected</p>
              <p className="text-xs text-gray-600 mt-1">NPC Certified</p>
            </div>
          </div>

          {/* Privacy Sections */}
          <div className="space-y-6 animate-fade-in-up animation-delay-300">
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
              <h2 className="text-4xl font-bold mb-4">Questions About Your Privacy?</h2>
              <p className="text-xl text-blue-100 mb-2 max-w-2xl mx-auto">
                We're committed to transparency and protecting your data under Philippine law
              </p>
              <p className="text-sm text-blue-200 mb-8">
                Compliant with RA 10173 (Data Privacy Act of 2012) and NPC Regulations
              </p>
              <div className="inline-flex items-center space-x-2 px-8 py-4 bg-white bg-opacity-20 backdrop-blur-md rounded-xl border-2 border-white border-opacity-30">
                <Mail className="w-5 h-5" />
                <span className="font-semibold text-lg">privacy@conserve.neust.edu.ph</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;