// src/pages/ResearchDetail.js - FIXED FOR CLOUDINARY
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, 
  Bookmark, 
  BookmarkCheck, 
  Eye, 
  Calendar, 
  User,
  FileText,
  Tag,
  Share2,
  ExternalLink
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ResearchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [research, setResearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showCitation, setShowCitation] = useState(false);

  useEffect(() => {
    fetchResearch();
  }, [id]);

  const fetchResearch = async () => {
    try {
      const { data } = await api.get(`/research/${id}`);
      setResearch(data.research);
      
      if (user?.bookmarks) {
        setIsBookmarked(user.bookmarks.includes(id));
      }
    } catch (error) {
      console.error('Error fetching research:', error);
      toast.error('Failed to load research');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark');
      navigate('/login');
      return;
    }

    try {
      const { data } = await api.post(`/research/${id}/bookmark`);
      setIsBookmarked(data.bookmarked);
      toast.success(data.message);
    } catch (error) {
      console.error('Bookmark error:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const handleViewPDF = () => {
    if (!research || !research.pdfUrl) {
      toast.error('PDF not available');
      return;
    }

    // ✅ FIX: Cloudinary URLs are already complete - use them directly
    const pdfUrl = research.pdfUrl;
    
    console.log('Opening PDF:', pdfUrl);
    
    // Open PDF in new tab
    window.open(pdfUrl, '_blank');
    toast.success('Opening PDF...');
  };

  const handleDownload = async () => {
    try {
      // Track download
      await api.get(`/research/${id}/download`);
      
      // ✅ FIX: Use Cloudinary URL directly
      const pdfUrl = research.pdfUrl;
      
      // Create download link
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${research.title}.pdf`;
      link.target = '_blank'; // Open in new tab as fallback
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download');
    }
  };

  const generateCitation = (format) => {
    if (!research) return '';
    
    const authors = research.authors.map(a => a.name).join(', ');
    const year = research.yearPublished;
    const title = research.title;

    switch (format) {
      case 'APA':
        return `${authors}. (${year}). ${title}. NEUST College of Nursing Research Repository.`;
      case 'MLA':
        return `${authors}. "${title}." NEUST College of Nursing Research Repository, ${year}.`;
      case 'Chicago':
        return `${authors}. "${title}." NEUST College of Nursing Research Repository (${year}).`;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!research) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-navy-700 hover:text-navy-800 font-medium flex items-center"
        >
          ← Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-navy-100 text-navy-700 rounded-full text-sm font-medium mb-4">
              {research.subjectArea?.name}
            </span>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {research.title}
            </h1>
            
            <div className="flex items-center text-gray-600 mb-2">
              <User size={18} className="mr-2" />
              <span>
                {research.authors.map(a => a.name).join(', ')}
              </span>
            </div>

            <div className="flex items-center text-gray-600 mb-2">
              <Calendar size={18} className="mr-2" />
              <span>{research.yearPublished}</span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-4">
              <span className="flex items-center">
                <Eye size={16} className="mr-1" />
                {research.viewCount} views
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Download size={16} className="mr-1" />
                {research.downloadCount} downloads
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Bookmark size={16} className="mr-1" />
                {research.bookmarkCount} bookmarks
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8 pb-8 border-b">
            {/* VIEW PDF Button */}
            <button
              onClick={handleViewPDF}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-md"
            >
              <ExternalLink size={20} />
              <span>View PDF</span>
            </button>

            {/* DOWNLOAD PDF Button */}
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-6 py-3 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition font-medium shadow-md"
            >
              <Download size={20} />
              <span>Download PDF</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={handleBookmark}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition shadow-md ${
                  isBookmarked
                    ? 'bg-apricot-500 text-white hover:bg-apricot-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck size={20} />
                    <span>Bookmarked</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={20} />
                    <span>Bookmark</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setShowCitation(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium shadow-md"
            >
              <FileText size={20} />
              <span>Cite</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied!');
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium shadow-md"
            >
              <Share2 size={20} />
              <span>Share</span>
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Abstract</h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              {research.abstract}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {research.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  <Tag size={14} className="inline mr-1" />
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Research Information
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Submitted by:</dt>
              <dd className="font-medium text-gray-900">
                {research.submittedBy?.firstName} {research.submittedBy?.lastName}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Submission Date:</dt>
              <dd className="font-medium text-gray-900">
                {new Date(research.submittedAt).toLocaleDateString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Approval Date:</dt>
              <dd className="font-medium text-gray-900">
                {research.approvedAt 
                  ? new Date(research.approvedAt).toLocaleDateString()
                  : 'Pending'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Subject Area:</dt>
              <dd className="font-medium text-gray-900">
                {research.subjectArea?.name}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Citation Modal */}
      {showCitation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Cite This Research</h3>
            
            {['APA', 'MLA', 'Chicago'].map(format => (
              <div key={format} className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">{format}</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    {generateCitation(format)}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateCitation(format));
                      toast.success(`${format} citation copied!`);
                    }}
                    className="text-sm text-navy-700 hover:text-navy-800 font-medium"
                  >
                    Copy to clipboard
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowCitation(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchDetail;