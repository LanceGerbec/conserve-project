// src/components/SearchBar.js
// Purpose: Centered search bar component

import React, { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = "Search research papers..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
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
    }
  };

  return (
    <div className="w-full flex justify-center">
      <form onSubmit={handleSubmit} className="relative w-full max-w-3xl">
        <div
          className={`relative flex items-center bg-white rounded-full shadow-lg transition-all duration-200 ${
            isFocused ? 'ring-4 ring-apricot-300 shadow-2xl' : 'shadow-md'
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
            onFocus={() => setIsFocused(true)}
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
            className="absolute right-2 px-8 py-3 bg-apricot-500 text-white rounded-full hover:bg-apricot-600 transition font-semibold shadow-md hover:shadow-lg"
          >
            Search
          </button>
        </div>

        {/* Search Tips */}
        {isFocused && !searchTerm && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl shadow-xl p-5 z-10 border border-gray-100">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              💡 Search Tips:
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Search by title, author name, or keywords</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Our smart search handles typos automatically</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
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