import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, BookOpen, FileText, User, Mail, HelpCircle, Stethoscope, Shield, Clock, CheckCircle, AlertCircle, Upload, Heart } from 'lucide-react';

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Particle animation
  useEffect(() => {
    const canvas = document.getElementById('help-particle-canvas');
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

  const faqs = [
    {
      category: 'Getting Started',
      icon: User,
      questions: [
        {
          question: 'How do I register for an account?',
          answer: 'Click the "Register" button in the navigation bar, fill in your details including your name, email, and choose whether you are a student or faculty member. Students will need to provide their Student ID.'
        },
        {
          question: 'What are the system requirements?',
          answer: 'ConServe works on all modern web browsers (Chrome, Firefox, Safari, Edge). You need a stable internet connection and a device capable of viewing PDF files.'
        }
      ]
    },
    {
      category: 'Research Submission',
      icon: Upload,
      questions: [
        {
          question: 'How do I submit my research?',
          answer: 'After logging in, click "Submit Your Research" from the home page. Fill in all required information including title, abstract, authors, keywords, and upload your PDF file along with an optional cover image.'
        },
        {
          question: 'How long does it take for my research to be approved?',
          answer: 'Research submissions are reviewed by administrators. The approval process typically takes 2-5 business days. You will receive an email notification once your research is approved or if revisions are needed.'
        },
        {
          question: 'What file formats are accepted?',
          answer: 'We only accept PDF files for research papers. Cover images can be JPG, PNG, or GIF format. PDF files should be under 50MB and images under 5MB.'
        }
      ]
    },
    {
      category: 'Search & Discovery',
      icon: Search,
      questions: [
        {
          question: 'How do I search for research papers?',
          answer: 'Use the search bar on the home page. You can search by title, author name, or keywords. Our smart search system can handle typos and will show relevant results. You can also filter by subject area and year.'
        },
        {
          question: 'Can I bookmark research papers?',
          answer: 'Yes! When viewing any research paper, click the bookmark icon to save it to your bookmarks. You can access all your bookmarked papers from the Bookmarks section in the navigation menu.'
        },
        {
          question: 'How do I cite a research paper?',
          answer: 'Each research detail page includes citation information. You can copy the properly formatted citation in various styles (APA, MLA, Chicago) directly from the paper\'s page.'
        }
      ]
    },
    {
      category: 'Account & Security',
      icon: Shield,
      questions: [
        {
          question: 'Is my data secure?',
          answer: 'Yes, we take data security seriously. All passwords are encrypted using industry-standard encryption. We follow best practices for data protection and comply with privacy regulations.'
        },
        {
          question: 'How do I reset my password?',
          answer: 'Click on the "Forgot Password" link on the login page. Enter your email address and we\'ll send you instructions to reset your password.'
        },
        {
          question: 'Can I update my profile information?',
          answer: 'Yes, you can update your profile information by going to your account settings. You can change your name, student ID (for students), and other profile details.'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(faq =>
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const quickActions = [
    {
      icon: User,
      title: 'Getting Started',
      description: 'Learn how to create an account and navigate ConServe',
      color: 'from-navy-600 to-blue-700'
    },
    {
      icon: Upload,
      title: 'Submitting Research',
      description: 'Guidelines for submitting your research papers',
      color: 'from-blue-600 to-indigo-700'
    },
    {
      icon: Search,
      title: 'Search Tips',
      description: 'Make the most of our advanced search features',
      color: 'from-indigo-600 to-purple-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Particle Canvas */}
      <canvas 
        id="help-particle-canvas" 
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
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-navy-700 to-blue-900 rounded-3xl flex items-center justify-center shadow-2xl">
                <HelpCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-navy-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Help Center
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions and learn how to make the most of ConServe
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12 animate-fade-in-up animation-delay-200">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-navy-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all text-lg shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-fade-in-up animation-delay-300">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${action.color} rounded-2xl mb-4 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-gray-600">{action.description}</p>
                </div>
              );
            })}
          </div>

          {/* FAQs by Category */}
          <div className="space-y-8 animate-fade-in-up animation-delay-400">
            {filteredFaqs.map((category, categoryIndex) => {
              const CategoryIcon = category.icon;
              return (
                <div key={categoryIndex} className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-navy-100 rounded-xl">
                      <CategoryIcon className="w-6 h-6 text-navy-700" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">{category.category}</h2>
                  </div>

                  <div className="space-y-3">
                    {category.questions.map((faq, faqIndex) => {
                      const isOpen = openFaq === `${categoryIndex}-${faqIndex}`;
                      return (
                        <div 
                          key={faqIndex}
                          className="border-2 border-gray-100 rounded-xl overflow-hidden hover:border-navy-200 transition-all"
                        >
                          <button
                            onClick={() => setOpenFaq(isOpen ? null : `${categoryIndex}-${faqIndex}`)}
                            className="w-full flex justify-between items-center text-left p-5 hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-semibold text-gray-900 pr-4 text-lg">
                              {faq.question}
                            </span>
                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isOpen ? 'bg-navy-600' : 'bg-gray-200'}`}>
                              {isOpen ? (
                                <ChevronUp className="w-5 h-5 text-white" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-5 pt-2 bg-gray-50 border-t-2 border-gray-100 animate-fade-in">
                              <div className="flex items-start space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Results */}
          {searchQuery && filteredFaqs.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl shadow-xl border border-gray-100 animate-fade-in">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">Try different keywords or browse all categories</p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 bg-gradient-to-r from-navy-600 to-blue-600 text-white rounded-xl hover:from-navy-700 hover:to-blue-700 transition-all shadow-lg font-semibold"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Contact Section */}
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
              <h2 className="text-4xl font-bold mb-4">Still Need Help?</h2>
              <p className="text-xl text-blue-100 mb-2 max-w-2xl mx-auto">
                Can't find the answer you're looking for?
              </p>
              <p className="text-lg text-blue-200 mb-8">
                Our support team is here to assist you
              </p>
              <div className="inline-flex items-center space-x-2 px-8 py-4 bg-white bg-opacity-20 backdrop-blur-md rounded-xl border-2 border-white border-opacity-30">
                <Mail className="w-5 h-5" />
                <span className="font-semibold text-lg">support@conserve.neust.edu.ph</span>
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up animation-delay-700">
            <div className="text-center bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all">
              <FileText className="w-10 h-10 text-navy-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Documentation</h3>
              <p className="text-sm text-gray-600">Comprehensive guides and tutorials</p>
            </div>
            <div className="text-center bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all">
              <Clock className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <p className="font-bold text-gray-900 mb-2">24/7 Support</p>
              <p className="text-sm text-gray-600">Available whenever you need us</p>
            </div>
            <div className="text-center bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all">
              <BookOpen className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
              <p className="font-bold text-gray-900 mb-2">Knowledge Base</p>
              <p className="text-sm text-gray-600">Extensive resource library</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;