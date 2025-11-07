// src/components/ResearchCard.js - UPDATED WITH FULL ABSTRACT
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Download, Bookmark, Calendar, User, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ResearchCard = ({ research, variant = 'default' }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showFullAbstract, setShowFullAbstract] = useState(false);

  if (!research) return null;

  const handleViewFullResearch = () => {
    if (!isAuthenticated) {
      // Redirect to access gateway
      navigate('/access-gateway', { state: { researchId: research._id, from: 'research-card' } });
    } else {
      // Go to secure document viewer
      navigate(`/document/view/${research._id}`);
    }
  };

  // Compact variant for lists
  if (variant === 'compact') {
    return (
      <div className="block bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <span className="inline-block px-3 py-1 bg-navy-100 text-navy-700 rounded-full text-xs font-medium mb-2">
              {research.subjectArea?.name}
            </span>
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-navy-700">
              {research.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {research.authors?.[0]?.name} • {research.yearPublished}
            </p>
            
            {/* Full Abstract */}
            <div className="mb-3">
              <p className={`text-sm text-gray-700 leading-relaxed ${!showFullAbstract ? 'line-clamp-3' : ''}`}>
                {research.abstract}
              </p>
              {research.abstract.length > 200 && (
                <button
                  onClick={() => setShowFullAbstract(!showFullAbstract)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 flex items-center"
                >
                  {showFullAbstract ? (
                    <>Show less <ChevronUp size={14} className="ml-1" /></>
                  ) : (
                    <>Show more <ChevronDown size={14} className="ml-1" /></>
                  )}
                </button>
              )}
            </div>

            {/* View Full Research Button */}
            <button
              onClick={handleViewFullResearch}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-navy-600 to-blue-600 text-white rounded-lg hover:from-navy-700 hover:to-blue-700 transition font-medium shadow-md"
            >
              {isAuthenticated ? (
                <>
                  <Eye size={16} />
                  <span>View Full Research</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Login to View Full Research</span>
                </>
              )}
            </button>

            <div className="flex items-center text-xs text-gray-500 space-x-3 mt-2">
              <span className="flex items-center">
                <Eye size={12} className="mr-1" />
                {research.viewCount} views
              </span>
              <span className="flex items-center">
                <Download size={12} className="mr-1" />
                {research.downloadCount} downloads
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant - full card with complete abstract
  return (
    <div className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Cover Image */}
      {research.coverImage && (
        <div className="h-48 bg-gradient-to-br from-navy-600 to-navy-800 overflow-hidden">
          <img
            src={research.coverImage}
            alt={research.title}
            className="w-full h-full object-cover opacity-80"
          />
        </div>
      )}

      <div className="p-6">
        {/* Subject Badge */}
        <span className="inline-block px-3 py-1 bg-navy-100 text-navy-700 rounded-full text-xs font-medium mb-3">
          {research.subjectArea?.name || 'General'}
        </span>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {research.title}
        </h3>

        {/* Authors & Year */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <User size={16} className="mr-2" />
          <span className="line-clamp-1">
            {research.authors?.map(a => a.name).join(', ')}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Calendar size={16} className="mr-2" />
          <span>{research.yearPublished}</span>
        </div>

        {/* FULL Abstract - No Truncation */}
        <div className="mb-4 border-t border-gray-100 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Abstract</h4>
          <p className={`text-gray-700 text-sm leading-relaxed ${!showFullAbstract ? 'line-clamp-5' : ''}`}>
            {research.abstract}
          </p>
          {research.abstract.length > 300 && (
            <button
              onClick={() => setShowFullAbstract(!showFullAbstract)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center"
            >
              {showFullAbstract ? (
                <>Show less <ChevronUp size={16} className="ml-1" /></>
              ) : (
                <>Read full abstract <ChevronDown size={16} className="ml-1" /></>
              )}
            </button>
          )}
        </div>

        {/* View Full Research Button */}
        <button
          onClick={handleViewFullResearch}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-navy-600 to-blue-700 text-white rounded-lg hover:from-navy-700 hover:to-blue-800 transition font-semibold shadow-md hover:shadow-lg mb-4"
        >
          {isAuthenticated ? (
            <>
              <Eye size={18} />
              <span>View Full Research</span>
            </>
          ) : (
            <>
              <Lock size={18} />
              <span>Login to View Full Research</span>
            </>
          )}
        </button>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Eye size={16} className="mr-1" />
              {research.viewCount}
            </span>
            <span className="flex items-center">
              <Download size={16} className="mr-1" />
              {research.downloadCount}
            </span>
            <span className="flex items-center">
              <Bookmark size={16} className="mr-1" />
              {research.bookmarkCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchCard;