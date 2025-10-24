  // src/components/Navbar.js
  // Purpose: Main navigation bar

  import React, { useState } from 'react';
  import { Link, useNavigate } from 'react-router-dom';
  import { useAuth } from '../context/AuthContext';
  import { Menu, X, User, LogOut, BookMarked, LayoutDashboard } from 'lucide-react';

  const Navbar = () => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
      setShowLogoutConfirm(false);
      logout();
      navigate('/login');
    };

    return (
      <>
        <nav className="bg-navy-900 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-apricot-500 rounded-lg flex items-center justify-center font-bold text-xl">
                  C
                </div>
                <span className="text-2xl font-bold">ConServe</span>
              </Link>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="hover:text-apricot-400 transition">
                  Home
                </Link>
                <Link to="/about" className="hover:text-apricot-400 transition">
                  About
                </Link>
                <Link to="/help" className="hover:text-apricot-400 transition">
                  Help
                </Link>

                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-1 hover:text-apricot-400 transition"
                      >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                      </Link>
                    )}
                    <Link
                      to="/bookmarks"
                      className="flex items-center space-x-1 hover:text-apricot-400 transition"
                    >
                      <BookMarked size={18} />
                      <span>Bookmarks</span>
                    </Link>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 px-3 py-2 bg-navy-800 rounded-lg">
                        <User size={18} />
                        <span className="text-sm">
                          {user?.firstName} {user?.lastName}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="flex items-center space-x-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-2 hover:bg-navy-800 rounded-lg transition"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 bg-apricot-500 hover:bg-apricot-600 rounded-lg transition"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-navy-800"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-navy-800 border-t border-navy-700">
              <div className="px-4 py-3 space-y-3">
                <Link
                  to="/"
                  className="block py-2 hover:text-apricot-400 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="block py-2 hover:text-apricot-400 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/help"
                  className="block py-2 hover:text-apricot-400 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Help
                </Link>

                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block py-2 hover:text-apricot-400 transition"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/bookmarks"
                      className="block py-2 hover:text-apricot-400 transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Bookmarks
                    </Link>
                    <div className="pt-3 border-t border-navy-700">
                      <p className="text-sm text-gray-400 mb-2">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full text-left py-2 text-red-400 hover:text-red-300"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block py-2 hover:text-apricot-400 transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block py-2 bg-apricot-500 hover:bg-apricot-600 rounded-lg text-center transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Confirm Logout
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to logout?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  export default Navbar;