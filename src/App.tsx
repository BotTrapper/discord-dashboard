import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { authService } from './lib/auth';

// Components
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import GuildSelection from './pages/GuildSelection';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import AutoResponses from './pages/AutoResponses';
import Settings from './pages/Settings';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/guilds"
              element={
                <ProtectedRoute>
                  <GuildSelection />
                </ProtectedRoute>
              }
            />

            {/* Dashboard Routes */}
            <Route
              path="/dashboard/:guildId"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="autoresponses" element={<AutoResponses />} />
              <Route path="statistics" element={<div className="text-center py-12 text-gray-600 dark:text-gray-400">Statistics page coming soon...</div>} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Redirect root to guilds if authenticated, otherwise to login */}
            <Route
              path="/"
              element={
                authService.isAuthenticated()
                  ? <Navigate to="/guilds" replace />
                  : <Navigate to="/login" replace />
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
