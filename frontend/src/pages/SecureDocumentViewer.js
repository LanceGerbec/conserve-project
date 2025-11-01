// src/pages/SecureDocumentViewer.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, 
  AlertTriangle, 
  Lock, 
  Eye,
  Shield,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SecureDocumentViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [research, setResearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [warningCount, setWarningCount] = useState(0);
  const sessionIdRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view documents');
      navigate('/login');
      return;
    }

    generateSessionId();
    fetchResearch();
    logDocumentAccess('SESSION_START');

    // Security: Disable right-click, copy, print
    const preventActions = (e) => {
      e.preventDefault();
      handleSecurityWarning('ATTEMPT_COPY');
      return false;
    };

    const preventKeyboardShortcuts = (e) => {
      // Prevent Ctrl+C, Ctrl+P, Ctrl+S, Ctrl+Shift+S, Print Screen
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'p' || e.key === 's')) ||
        (e.ctrlKey && e.shiftKey && e.key === 's') ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        handleSecurityWarning('ATTEMPT_COPY');
        return false;
      }
    };

    document.addEventListener('contextmenu', preventActions);
    document.addEventListener('copy', preventActions);
    document.addEventListener('cut', preventActions);
    document.addEventListener('keydown', preventKeyboardShortcuts);

    // Prevent text selection
    if (viewerRef.current) {
      viewerRef.current.style.userSelect = 'none';
      viewerRef.current.style.webkitUserSelect = 'none';
      viewerRef.current.style.mozUserSelect = 'none';
    }

    return () => {
      document.removeEventListener('contextmenu', preventActions);
      document.removeEventListener('copy', preventActions);
      document.removeEventListener('cut', preventActions);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      logDocumentAccess('SESSION_END');
    };
  }, [id, isAuthenticated, navigate]);

  const generateSessionId = () => {
    sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const fetchResearch = async () => {
    try {
      const { data } = await api.get(`/research/${id}`);
      setResearch(data.research);
      logDocumentAccess('VIEW_DOCUMENT');
    } catch (error) {
      console.error('Error fetching research:', error);
      toast.error('Failed to load document');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const logDocumentAccess = async (action, metadata = {}) => {
    try {
      await api.post('/document-logs', {
        researchId: id,
        action,
        severity: action.includes('ATTEMPT') || action === 'SECURITY_WARNING' ? 'WARNING' : 'INFO',
        metadata: {
          ...metadata,
          sessionId: sessionIdRef.current,
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error logging access:', error);
    }
  };

  const handleSecurityWarning = (action) => {
    const newCount = warningCount + 1;
    setWarningCount(newCount);

    let message = '';
    let severity = 'WARNING';

    if (newCount === 1) {
      message = '⚠️ Warning: This action is prohibited and has been logged.';
    } else if (newCount === 2) {
      message = '⚠️⚠️ Second Warning: Continued violations may result in account suspension.';
    } else if (newCount >= 3) {
      message = '🚫 CRITICAL: Multiple security violations detected. Your account may be suspended.';
      severity = 'CRITICAL';
    }

    toast.error(message);

    logDocumentAccess(action, {
      warningCount: newCount,
      severity,
      description: message
    });
  };

  const handleDownload = async () => {
    try {
      logDocumentAccess('ATTEMPT_DOWNLOAD');
      
      const { data } = await api.get(`/research/${id}/download`);
      
      // Create download link
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.filename;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      logDocumentAccess('DOWNLOAD_DOCUMENT');
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="spinner mx-auto mb-4"></div>
          <p>Loading secure document viewer...</p>
        </div>
      </div>
    );
  }

  if (!research) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Security Warning Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-semibold">
              SECURE VIEWING MODE - Copying, printing, and screenshots are prohibited and logged
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <Eye className="w-4 h-4" />
            <span>Viewed by: {user?.firstName} {user?.lastName}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              <X size={18} />
              <span>Close</span>
            </button>

            <div className="border-l border-gray-600 pl-4">
              <h2 className="text-lg font-semibold line-clamp-1">{research.title}</h2>
              <p className="text-sm text-gray-400">
                {research.authors?.map(a => a.name).join(', ')} • {research.yearPublished}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Page Navigation */}
            <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1 hover:bg-gray-600 rounded disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm">
                {currentPage} / {numPages || '?'}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                disabled={currentPage === numPages}
                className="p-1 hover:bg-gray-600 rounded disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2">
              <button
                onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                className="px-2 py-1 hover:bg-gray-600 rounded text-sm"
              >
                -
              </button>
              <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale(Math.min(2, scale + 0.1))}
                className="px-2 py-1 hover:bg-gray-600 rounded text-sm"
              >
                +
              </button>
            </div>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              <Download size={18} />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div 
        ref={viewerRef}
        className="flex-1 overflow-auto p-8"
        style={{ 
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none'
        }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Watermark Overlay */}
          <div 
            className="relative bg-white rounded-lg shadow-2xl"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s'
            }}
          >
            {/* Visible Watermark */}
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-10">
              <div className="transform -rotate-45">
                <p className="text-6xl font-bold text-gray-800">
                  CONFIDENTIAL
                </p>
                <p className="text-2xl text-center text-gray-700 mt-2">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xl text-center text-gray-600">
                  NEUST Nursing - {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* PDF Content */}
            <div className="p-8">
              {pdfLoading && (
                <div className="flex items-center justify-center py-32">
                  <div className="text-center">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading PDF...</p>
                  </div>
                </div>
              )}

              <iframe
                src={`${research.pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full"
                style={{ height: '1000px', border: 'none' }}
                title="Research Document"
                onLoad={() => setPdfLoading(false)}
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Warning Modal */}
      {warningCount >= 3 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-red-900 text-white rounded-xl p-8 max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-12 h-12" />
              <h3 className="text-2xl font-bold">Security Alert</h3>
            </div>
            <p className="mb-6">
              Multiple security violations have been detected. Your activities have been logged.
              Continued violations may result in account suspension.
            </p>
            <button
              onClick={() => setWarningCount(0)}
              className="w-full px-6 py-3 bg-white text-red-900 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecureDocumentViewer;