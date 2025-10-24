// src/pages/Bookmarks.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, Trash2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const { data } = await api.get('/research/user/bookmarks');
      setBookmarks(data.bookmarks);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (id) => {
    try {
      await api.post(`/research/${id}/bookmark`);
      setBookmarks(bookmarks.filter(b => b._id !== id));
      toast.success('Bookmark removed');
    } catch (error) {
      console.error('Remove bookmark error:', error);
      toast.error('Failed to remove bookmark');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
            <BookMarked className="mr-3" />
            My Bookmarks
          </h1>
          <p className="text-gray-600">
            {bookmarks.length} saved research papers
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <BookMarked className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No bookmarks yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start bookmarking research papers to save them here
            </p>
            <Link to="/" className="btn-primary">
              Browse Research
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookmarks.map((research) => (
              <div
                key={research._id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="px-3 py-1 bg-navy-100 text-navy-700 rounded-full text-sm font-medium">
                    {research.subjectArea?.name}
                  </span>
                  <button
                    onClick={() => removeBookmark(research._id)}
                    className="text-red-600 hover:text-red-700 p-2"
                    title="Remove bookmark"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <Link to={`/research/${research._id}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-navy-700 transition">
                    {research.title}
                  </h3>
                </Link>

                <p className="text-gray-600 text-sm mb-3">
                  {research.authors?.[0]?.name} • {research.yearPublished}
                </p>

                <p className="text-gray-700 line-clamp-3 text-sm">
                  {research.abstract}
                </p>

                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span className="mr-4">👁️ {research.viewCount} views</span>
                  <span>📥 {research.downloadCount} downloads</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;