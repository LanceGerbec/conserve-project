// src/components/SearchBar.js
// Purpose: Centered search bar component - FIXED OVERLAP

import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = "Search research papers..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const inputRef = useRef(null);
  const tipsRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
      setShowTips(false);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
      setShowTips(false);
    }
  };

  // Handle clicks outside to close tips
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tipsRef.current && !tipsRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowTips(false);
      }
    };

    if (showTips) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTips]);

  return (
    <div className="w-full flex justify-center">
      <form onSubmit={handleSubmit} className="relative w-full max-w-3xl">
        <div
          className={`relative flex items-center bg-white rounded-full shadow-lg transition-all duration-200 ${
            isFocused ? 'ring-4 ring-blue-300 shadow-2xl' : 'shadow-md'
          }`}
        >
          {/* Search Icon */}
          <div className="absolute left-6 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={22} />
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              if (!searchTerm) {
                setShowTips(true);
              }
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-14 pr-32 py-5 bg-transparent text-gray-900 text-lg placeholder-gray-500 focus:outline-none rounded-full"
          />

          {/* Clear Button */}
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-24 p-2 text-gray-400 hover:text-gray-600 transition rounded-full hover:bg-gray-100"
              title="Clear search"
            >
              <X size={20} />
            </button>
          )}

          {/* Search Button */}
          <button
            type="submit"
            className="absolute right-2 px-8 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full hover:from-orange-500 hover:to-orange-600 transition font-semibold shadow-md hover:shadow-lg"
          >
            Search
          </button>
        </div>

        {/* Search Tips - Positioned ABOVE the search bar */}
        {showTips && !searchTerm && (
          <div 
            ref={tipsRef}
            className="absolute bottom-full left-0 right-0 mb-3 bg-white rounded-xl shadow-2xl p-5 z-50 border-2 border-blue-200 animate-fade-in"
            style={{ maxWidth: '100%' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900 flex items-center">
                <span className="text-xl mr-2">💡</span>
                Search Tips:
              </p>
              <button
                type="button"
                onClick={() => setShowTips(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 font-bold">•</span>
                <span>Search by title, author name, or keywords</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 font-bold">•</span>
                <span>Our smart search handles typos automatically</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600 font-bold">•</span>
                <span>Try "diabetes care" or "mental health nursing"</span>
              </li>
            </ul>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;