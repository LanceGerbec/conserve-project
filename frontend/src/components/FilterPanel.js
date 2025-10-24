// src/components/FilterPanel.js
// Purpose: Filter panel for research papers

import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../utils/api';

const FilterPanel = ({ onFilterChange, initialFilters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [filters, setFilters] = useState({
    subjectArea: initialFilters.subjectArea || '',
    year: initialFilters.year || '',
    sort: initialFilters.sort || 'recent'
  });

  useEffect(() => {
    fetchSubjectAreas();
  }, []);

  const fetchSubjectAreas = async () => {
    try {
      const { data } = await api.get('/admin/subjects');
      setSubjectAreas(data.subjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { subjectArea: '', year: '', sort: 'recent' };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = filters.subjectArea || filters.year || filters.sort !== 'recent';

  // Generate year options (last 25 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 25 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-gray-900 font-semibold"
        >
          <Filter size={20} />
          <span>Filters</span>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
          >
            <X size={16} className="mr-1" />
            Clear All
          </button>
        )}
      </div>

      {/* Filter Options */}
      {isOpen && (
        <div className="space-y-4 pt-4 border-t">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="mostCited">Most Cited</option>
            </select>
          </div>

          {/* Subject Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Area
            </label>
            <select
              value={filters.subjectArea}
              onChange={(e) => handleFilterChange('subjectArea', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            >
              <option value="">All Subjects</option>
              {subjectAreas.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name} ({subject.researchCount})
                </option>
              ))}
            </select>
          </div>

          {/* Year Published */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Published
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Apply Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full px-4 py-2 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition font-medium"
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* Active Filters Display */}
      {!isOpen && hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.subjectArea && (
            <span className="px-3 py-1 bg-navy-100 text-navy-700 rounded-full text-sm font-medium">
              Subject: {subjectAreas.find(s => s._id === filters.subjectArea)?.name}
            </span>
          )}
          {filters.year && (
            <span className="px-3 py-1 bg-navy-100 text-navy-700 rounded-full text-sm font-medium">
              Year: {filters.year}
            </span>
          )}
          {filters.sort !== 'recent' && (
            <span className="px-3 py-1 bg-navy-100 text-navy-700 rounded-full text-sm font-medium">
              Sort: {filters.sort === 'popular' ? 'Most Popular' : 'Most Cited'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;