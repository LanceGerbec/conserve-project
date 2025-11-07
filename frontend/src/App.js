// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Toast from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Help from './pages/Help';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ResearchDetail from './pages/ResearchDetail';
import SubmitResearch from './pages/SubmitResearch';
import Bookmarks from './pages/Bookmarks';
import AdminDashboard from './pages/AdminDashboard';
import SubjectManagement from './pages/SubjectManagement';
import UserManagement from './pages/UserManagement';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AdminResearchManagement from './pages/AdminResearchManagement';
import ErrorBoundary from './components/ErrorBoundary';
import AdminAuthorizedNumbers from './pages/AdminAuthorizedNumbers';
import SecureDocumentViewer from './pages/SecureDocumentViewer';
import AccessGateway from './pages/AccessGateway';

import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toast />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes - NO AUTHENTICATION REQUIRED */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/help" element={<Help />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/research/:id" element={<ResearchDetail />} />

              {/* Protected Routes - REQUIRES LOGIN */}
              <Route
                path="/submit"
                element={
                  <ProtectedRoute>
                    <SubmitResearch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookmarks"
                element={
                  <ProtectedRoute>
                    <Bookmarks />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes - REQUIRES ADMIN ROLE */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/subjects"
                element={
                  <ProtectedRoute adminOnly>
                    <SubjectManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute adminOnly>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute adminOnly>
                    <AnalyticsDashboard />
                  </ProtectedRoute>
                }
              />

            <Route
                path="/admin/research"
                element={
                 <ProtectedRoute adminOnly>
                 <AdminResearchManagement />
                 </ProtectedRoute>
                 }
              />

              <Route
  path="/document/view/:id"
  element={
    <ProtectedRoute>
      <SecureDocumentViewer />
    </ProtectedRoute>
  }
/>


              {/* 404 - Page Not Found */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-xl text-gray-600 mb-6">Page not found</p>
                      <a href="/" className="btn-primary">
                        Go Home
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;