import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, CircularProgress } from '@mui/material';
import Dashboard from './Dashboard';
import ScheduleDetailPage from './ScheduleDetailPage';
import UserProfile from './UserProfile';
import CaseListPage from './CaseListPage';
import LoginPage from './LoginPage';
import CategoryPage from './CategoryPage';
import Header from './Header';
import Footer from './Footer';
import AdminDashboard from './admin/AdminDashboard';
import AdminProfile from './admin/AdminProfile';
import UserManagement from './admin/UserManagement';
import ProtectedRoute from './ProtectedRoute';
import Files from './Files';
import CaseSchedule from './CaseSchedule';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      const sessionActive = sessionStorage.getItem('sessionActive');

      // Jika tidak ada session active, hapus semua data auth
      if (!sessionActive) {
        localStorage.clear();
        setIsLoggedIn(false);
        setUserRole('');
        navigate('/login');
      } else if (token && role) {
        setIsLoggedIn(true);
        setUserRole(role);
        
        // Redirect ke halaman yang sesuai jika di login/root
        if (location.pathname === '/login' || location.pathname === '/') {
          navigate(role === 'admin' ? '/admin' : '/dashboard');
        }
      } else {
        setIsLoggedIn(false);
        setUserRole('');
        navigate('/login');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [location.pathname, navigate]);

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    sessionStorage.setItem('sessionActive', 'true');
    navigate(role === 'admin' ? '/admin' : '/dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    localStorage.clear();
    sessionStorage.removeItem('sessionActive');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isLoggedIn && <Header userRole={userRole} handleLogout={handleLogout} />}
      <Container component="main" sx={{ mt: 3, mb: 2, flexGrow: 1 }}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              isLoggedIn ? 
                <Navigate to={userRole === 'admin' ? "/admin" : "/dashboard"} replace /> 
                : 
                <LoginPage setIsLoggedIn={handleLogin} />
            } 
          />

          {/* Protected User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAllowed={isLoggedIn && userRole === 'user'}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute isAllowed={isLoggedIn && userRole === 'user'}>
                <UserProfile handleLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAllowed={isLoggedIn && userRole === 'admin'}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute isAllowed={isLoggedIn && userRole === 'admin'}>
                <AdminProfile handleLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute isAllowed={isLoggedIn && userRole === 'admin'}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          {/* Protected Common Routes */}
          <Route
            path="/cases/:category"
            element={
              <ProtectedRoute isAllowed={isLoggedIn}>
                <CaseListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/case/:id"
            element={
              <ProtectedRoute isAllowed={isLoggedIn}>
                <ScheduleDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/category"
            element={
              <ProtectedRoute isAllowed={isLoggedIn}>
                <CategoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/files"
            element={
              <ProtectedRoute>
                <Files />
              </ProtectedRoute>
            }
          />

          <Route
            path="/case-schedule"
            element={
              <ProtectedRoute isAllowed={isLoggedIn}>
                <CaseSchedule />
              </ProtectedRoute>
            }
          />

          {/* Redirect Routes */}
          <Route 
            path="/" 
            element={
              <Navigate 
                to={isLoggedIn ? (userRole === 'admin' ? "/admin" : "/dashboard") : "/login"} 
                replace 
              />
            } 
          />

          <Route 
            path="*" 
            element={
              <Navigate 
                to={isLoggedIn ? (userRole === 'admin' ? "/admin" : "/dashboard") : "/login"} 
                replace 
              />
            } 
          />
        </Routes>
      </Container>
      {isLoggedIn && <Footer />}
    </Box>
  );
}

export default AppContent;
