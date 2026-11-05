import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ExploreSkills from './pages/ExploreSkills';
import Profile from './pages/Profile';
import MyRequests from './pages/MyRequests';
import Chats from './pages/Chats';

import { authService } from './services/api';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('skillswap_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loadingAuth, setLoadingAuth] = useState(true);

  // On initial mount, verify token with backend if present
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await authService.getProfile();
          setCurrentUser(profile);
          localStorage.setItem('skillswap_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Could not verify existing session with backend:', err.message);
          // Keep existing saved user or clear if unauthorized
          if (err.response && err.response.status === 401) {
            authService.logout();
            setCurrentUser(null);
          }
        }
      }
      setLoadingAuth(false);
    };

    checkAuth();
  }, []);

  // Sync user state with local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('skillswap_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('skillswap_user', JSON.stringify(userData));
  };

  const handleSignup = (newUserData) => {
    setCurrentUser(newUserData);
    localStorage.setItem('skillswap_user', JSON.stringify(newUserData));
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('skillswap_user', JSON.stringify(updatedUser));
  };

  if (loadingAuth) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontSize: '1.1rem',
          color: 'var(--primary-purple)',
          fontWeight: 600,
        }}
      >
        Loading SkillSwap...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Sticky Navigation Bar */}
        <Navbar currentUser={currentUser} onLogout={handleLogout} />

        {/* Main Content Pages */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home currentUser={currentUser} />} />

            <Route
              path="/login"
              element={
                currentUser ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />

            <Route
              path="/signup"
              element={
                currentUser ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Signup onSignup={handleSignup} />
                )
              }
            />

            <Route
              path="/verify-email"
              element={
                currentUser ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <VerifyOtp onLogin={handleLogin} />
                )
              }
            />

            <Route path="/verify-otp" element={<Navigate to="/verify-email" replace />} />

            <Route
              path="/forgot-password"
              element={
                currentUser ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <ForgotPassword />
                )
              }
            />

            <Route
              path="/reset-password"
              element={
                currentUser ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <ResetPassword />
                )
              }
            />

            <Route
              path="/dashboard"
              element={
                <Dashboard
                  currentUser={currentUser}
                  onUpdateUser={handleUpdateUser}
                />
              }
            />

            <Route
              path="/explore"
              element={<ExploreSkills currentUser={currentUser} />}
            />

            <Route
              path="/profile"
              element={
                <Profile
                  currentUser={currentUser}
                  onUpdateUser={handleUpdateUser}
                />
              }
            />

            <Route
              path="/requests"
              element={<MyRequests currentUser={currentUser} />}
            />

            <Route
              path="/chats"
              element={
                currentUser ? (
                  <Chats currentUser={currentUser} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
