// src/pages/SecureDocumentViewer.js - COMPLETE SECURE VIEWER
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, AlertTriangle, Lock, Eye, Shield, X,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  RotateCw, FileWarning, Activity, Clock
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
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [idleTime, setIdleTime] = useState(0);
  const sessionIdRef = useRef(null);
  const viewerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const sessionTimerRef = useRef(null);

  // Session timeout constants
  const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  const SESSION_WARNING = 13 * 60 * 1000; // 13 minutes (warn 2 min before)

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view documents');
      navigate('/login');
      return;
    }

    generateSessionId();
    fetchResearch();
    logDocumentAccess('SESSION_START');
    startSessionTimer();
    startIdleTimer();

    // ENHANCED SECURITY MEASURES
    const preventActions = (e) => {
      e.preventDefault();
      handleSecurityWarning('ATTEMPT_COPY');
      return false;
    };

    const preventKeyboardShortcuts = (e) => {
      // Block: Ctrl+C, Ctrl+P, Ctrl+S, Ctrl+U, Ctrl+Shift+I, Ctrl+Shift+J, PrintScreen, F12
      if (
        (e.ctrlKey && ['c', 'p', 's', 'u'].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 's'].includes(e.key.toLowerCase())) ||
        e.key === 'PrintScreen' ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        handleSecurityWarning('ATTEMPT_COPY');
        return false;
      }
    };

    const resetIdleTimer = () => {
      setIdleTime(0);
    };

    const handleWindowBlur = () => {
      logDocumentAccess('WINDOW_BLUR', { warning: 'User left window' });
    };

    const handleWindowFocus = () => {
      logDocumentAccess('WINDOW_FOCUS', { warning: 'User returned' });
    };

    // Add all event listeners
    document.addEventListener('contextmenu', preventActions);
    document.addEventListener('copy', preventActions);
    document.addEventListener('cut', preventActions);
    document.addEventListener('paste', preventActions);
    document.addEventListener('keydown', preventKeyboardShortcuts);
    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('keypress', resetIdleTimer);
    document.addEventListener('click', resetIdleTimer);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    // Prevent text selection
    if (viewerRef.current) {
      viewerRef.current.style.userSelect = 'none';
      viewerRef.current.style.webkitUserSelect = 'none';
      viewerRef.current.style.mozUserSelect = 'none';
      viewerRef.current.style.msUserSelect = 'none';
    }

    return () => {
      document.removeEventListener('contextmenu', preventActions);
      document.removeEventListener('copy', preventActions);
      document.removeEventListener('cut', preventActions);
      document.removeEventListener('paste', preventActions);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      document.removeEventListener('mousemove', resetIdleTimer);
      document.removeEventListener('keypress', resetIdleTimer);
      document.removeEventListener('click', resetIdleTimer);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      
      logDocumentAccess('SESSION_END', { 
        duration: sessionTime,
        warnings: warningCount 
      });
      
      clearInterval(idleTimerRef.current);
      clearInterval(sessionTimerRef.current);
    };
  }, [id, isAuthenticated, navigate]);

  const startSessionTimer = () => {
    sessionTimerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
  };

  const startIdleTimer = () => {
    idleTimerRef.current = setInterval(() => {
      setIdleTime(prev => {
        const newIdleTime = prev + 1000;
        
        if (newIdleTime === SESSION_WARNING) {
          toast.error('⚠️ You will be logged out in 2 minutes due to inactivity', {
            duration: 10000
          });
          logDocumentAccess('IDLE_WARNING', { idleTime: newIdleTime });
        }
        
        if (newIdleTime >= IDLE_TIMEOUT) {
          toast.error('Session expired due to inactivity');
          logDocumentAccess('SESSION_TIMEOUT', { idleTime: newIdleTime });
          navigate('/login');
        }
        
        return newIdleTime;
      });
    }, 1000);
  };

  const generateSessionId = () => {
    sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const fetchResearch = async () => {
    try {
      const { data } = await api.get(`/research/${id}`);
      setResearch(data.research);
      logDocumentAccess('VIEW_DOCUMENT', { title: data.research.title });
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
          timestamp: new Date().toISOString(),
          sessionDuration: sessionTime,
          warningCount: warningCount,
          page: currentPage,
          scale: scale,
          rotation: rotation
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
      message = '⚠️ Warning #1: This action is prohibited and has been logged.';
      severity = 'WARNING';
    } else if (newCount === 2) {
      message = '⚠️⚠️ Warning #2: Continued violations may result in account suspension.';
      severity = 'WARNING';
    } else if (newCount >= 3) {
      message = '🚫 CRITICAL WARNING #' + newCount + ': Multiple violations detected. Administrator notified.';
      severity = 'CRITICAL';
    }

    toast.error(message, { duration: 8000 });

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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    logDocumentAccess('PAGE_CHANGE', { fromPage: currentPage, toPage: newPage });
  };

  const handleZoom = (delta) => {
    const newScale = Math.max(0.5, Math.min(2, scale + delta));
    setScale(newScale);
    logDocumentAccess('ZOOM_CHANGE', { oldScale: scale, newScale });
  };

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    logDocumentAccess('ROTATE', { oldRotation: rotation, newRotation });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading secure document viewer...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (!research) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ENHANCED SECURITY WARNING BANNER */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 py-3 px-4 border-b-2 border-red-900 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-bold">
              🔒 SECURE MODE - All actions monitored • Copying/Printing PROHIBITED
            </span>
          </div>
          <div className="flex items-center space-x-4 text-xs font-medium">
            <div className="flex items-center space-x-2 bg-red-800 px-3 py-1 rounded-full">
              <Eye className="w-4 h-4" />
              <span>{user?.firstName} {user?.lastName}</span>
            </div>
            <div className="flex items-center space-x-2 bg-red-800 px-3 py-1 rounded-full">
              <Clock className="w-4 h-4" />
              <span>{formatTime(sessionTime)}</span>
            </div>
            {warningCount > 0 && (
              <div className="flex items-center space-x-2 bg-yellow-600 px-3 py-1 rounded-full animate-pulse">
                <FileWarning className="w-4 h-4" />
                <span>⚠️ {warningCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ENHANCED TOOLBAR */}
      <div className="bg-gray-800 border-b border-gray-700 py-4 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                logDocumentAccess('CLOSE_VIEWER');
                navigate(-1);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition shadow-md"
            >
              <X size={18} />
              <span>Close</span>
            </button>

            <div className="border-l border-gray-600 pl-4 max-w-lg">
              <h2 className="text-lg font-semibold line-clamp-1">{research.title}</h2>
              <p className="text-sm text-gray-400">
                {research.authors?.map(a => a.name).join(', ')} • {research.yearPublished}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 flex-wrap">
            {/* Page Navigation */}
            <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2 shadow-md">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm min-w-[70px] text-center font-medium">
                Page {currentPage}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-1 hover:bg-gray-600 rounded"
                title="Next Page"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2 shadow-md">
              <button
                onClick={() => handleZoom(-0.1)}
                disabled={scale <= 0.5}
                className="p-1 hover:bg-gray-600 rounded disabled:opacity-50"
                title="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-sm w-14 text-center font-medium">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.1)}
                disabled={scale >= 2}
                className="p-1 hover:bg-gray-600 rounded disabled:opacity-50"
                title="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
            </div>

            {/* Rotate */}
            <button
              onClick={handleRotate}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition shadow-md"
              title="Rotate 90°"
            >
              <RotateCw size={18} />
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-md font-medium"
            >
              <Download size={18} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* PDF VIEWER WITH MULTI-LAYER WATERMARKS */}
      <div 
        ref={viewerRef}
        className="flex-1 overflow-auto p-8 bg-gray-850"
        style={{ 
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          WebkitTouchCallout: 'none'
        }}
        onDragStart={(e) => e.preventDefault()}
      >
        <div className="max-w-5xl mx-auto">
          <div 
            className="relative bg-white rounded-lg shadow-2xl"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'top center',
              transition: 'transform 0.3s ease'
            }}
          >
            {/* ========================================= */}
            {/* MULTI-LAYER WATERMARK SYSTEM */}
            {/* ========================================= */}
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
              
              {/* Layer 1: Large Diagonal Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-8">
                <div className="transform -rotate-45 text-center">
                  <p className="text-7xl font-black text-gray-800 tracking-wider mb-3">
                    CONFIDENTIAL
                  </p>
                  <p className="text-4xl font-bold text-gray-700 mb-2">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-2xl font-semibold text-gray-600 mb-1">
                    {user?.email}
                  </p>
                  <p className="text-xl text-gray-600">
                    NEUST College of Nursing
                  </p>
                  <p className="text-lg text-gray-500 mt-2">
                    {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
                  </p>
                  <p className="text-base text-gray-500 mt-2 font-mono">
                    ID: {sessionIdRef.current?.slice(-12)}
                  </p>
                </div>
              </div>

              {/* Layer 2: Corner Watermarks */}
              <div className="absolute top-4 left-4 text-xs text-gray-500 opacity-60 bg-white bg-opacity-50 px-2 py-1 rounded">
                <p className="font-semibold">Viewed by:</p>
                <p>{user?.firstName} {user?.lastName}</p>
                <p>{user?.email}</p>
              </div>
              
              <div className="absolute top-4 right-4 text-xs text-gray-500 opacity-60 text-right bg-white bg-opacity-50 px-2 py-1 rounded">
                <p className="font-semibold">{new Date().toLocaleString()}</p>
                <p>Page {currentPage}</p>
                <p>Session: {formatTime(sessionTime)}</p>
              </div>
              
              <div className="absolute bottom-4 left-4 text-xs text-gray-500 opacity-60 bg-white bg-opacity-50 px-2 py-1 rounded">
                <p className="font-semibold">NEUST Nursing Repository</p>
                <p>© {new Date().getFullYear()} All Rights Reserved</p>
              </div>
              
              <div className="absolute bottom-4 right-4 text-xs text-gray-500 opacity-60 text-right bg-white bg-opacity-50 px-2 py-1 rounded font-mono">
                <p>Session: {sessionIdRef.current?.slice(-8)}</p>
                <p>Warnings: {warningCount}</p>
              </div>

              {/* Layer 3: Repeating Background Pattern */}
              <div className="absolute inset-0 opacity-4">
                <div className="grid grid-cols-4 gap-8 h-full p-8">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="flex items-center justify-center">
                      <div className="transform -rotate-45 text-center">
                        <p className="text-xl font-bold text-gray-600 whitespace-nowrap">
                          {user?.firstName}
                        </p>
                        <p className="text-xl font-bold text-gray-600 whitespace-nowrap">
                          {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layer 4: Border Watermark */}
              <div className="absolute inset-0 border-4 border-red-500 opacity-10 pointer-events-none"></div>
            </div>

            {/* PDF IFRAME */}
            <div className="p-8 relative z-0">
              <iframe
                src={`${research.pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=100`}
                className="w-full rounded-lg shadow-inner"
                style={{ 
                  height: '1100px', 
                  border: 'none',
                  pointerEvents: 'auto'
                }}
                title="Research Document"
                sandbox="allow-same-origin allow-scripts"
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleSecurityWarning('ATTEMPT_COPY');
                }}
                onLoad={() => {
                  logDocumentAccess('PDF_LOADED');
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CRITICAL SECURITY WARNING MODAL */}
      {warningCount >= 3 && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-white rounded-2xl p-8 max-w-lg shadow-2xl border-4 border-red-600 animate-pulse">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-red-700 rounded-full">
                <AlertTriangle className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <h3 className="text-3xl font-black">SECURITY ALERT</h3>
                <p className="text-red-200 text-sm">Critical Violations Detected</p>
              </div>
            </div>
            
            <div className="bg-red-950 rounded-xl p-6 mb-6 border border-red-700">
              <p className="mb-4 font-bold text-lg">⚠️ Your Actions Have Been Logged:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span><strong>Total Warnings:</strong> {warningCount} violations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span><strong>Session Duration:</strong> {formatTime(sessionTime)}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span><strong>User:</strong> {user?.firstName} {user?.lastName} ({user?.email})</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span><strong>Document:</strong> {research.title.substring(0, 50)}...</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span><strong>Status:</strong> Administrator has been notified</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-900 bg-opacity-50 rounded-lg p-4 mb-6 border border-yellow-700">
              <p className="font-bold mb-2 text-yellow-200">⚠️ CONSEQUENCES:</p>
              <ul className="text-sm space-y-1 text-yellow-100">
                <li>• Immediate account review</li>
                <li>• Possible account suspension</li>
                <li>• Disciplinary action by institution</li>
                <li>• Potential legal consequences</li>
              </ul>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-red-100">
              This is a <strong>FINAL WARNING</strong>. All your activities in this session have been recorded and reported to the system administrator. Any further violations will result in immediate action.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  logDocumentAccess('CLOSED_CRITICAL_WARNING', { 
                    totalWarnings: warningCount,
                    acknowledged: true 
                  });
                  navigate('/');
                }}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
              >
                Exit Viewer
              </button>
              <button
                onClick={() => {
                  setWarningCount(0);
                  logDocumentAccess('ACKNOWLEDGED_CRITICAL_WARNING', { 
                    totalWarnings: warningCount 
                  });
                  toast.success('Warning acknowledged. You may continue viewing.', {
                    duration: 5000
                  });
                }}
                className="flex-1 px-6 py-3 bg-white text-red-900 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg"
              >
                I Understand - Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IDLE WARNING NOTIFICATION */}
      {idleTime > SESSION_WARNING && idleTime < IDLE_TIMEOUT && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-4 rounded-xl shadow-2xl z-40 animate-bounce border-2 border-yellow-300">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6" />
            <div>
              <p className="font-bold text-lg">⚠️ Inactivity Warning</p>
              <p className="text-sm">
                Logging out in <strong>{Math.ceil((IDLE_TIMEOUT - idleTime) / 60000)}</strong> minute(s)
              </p>
              <p className="text-xs mt-1 opacity-90">
                Move your mouse to stay active
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecureDocumentViewer;