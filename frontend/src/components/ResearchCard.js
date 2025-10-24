// src/components/ResearchCard.js
// Purpose: Reusable card component for displaying research papers

import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Download, Bookmark, Calendar, User } from 'lucide-react';

const ResearchCard = ({ research, variant = 'default' }) => {
  if (!research) return null;

  // Compact variant for lists
  if (variant === 'compact') {
    return (
      <Link
        to={`/research/${research._id}`}
        className="block bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
      >
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
            <div className="flex items-center text-xs text-gray-500 space-x-3">
              <span className="flex items-center">
                <Eye size={14} className="mr-1" />
                {research.viewCount}
              </span>
              <span className="flex items-center">
                <Download size={14} className="mr-1" />
                {research.downloadCount}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant - full card
  return (
    <Link
      to={`/research/${research._id}`}
      className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
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
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-navy-700 transition">
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

        {/* Abstract Preview */}
        <p className="text-gray-700 text-sm line-clamp-3 mb-4">
          {research.abstract}
        </p>

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
    </Link>
  );
};

export default ResearchCard;