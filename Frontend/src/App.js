import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './pages/dash';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import theme from './theme';
import NavBar from './components/NavBar';
import HateSpeechDetector from './components/HateSpeechDetector';
import LandingPage from './pages/landing_page';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {/* Navbar appears on all routes except landing page */}
        <Routes>
          <Route path="/" element={null} />
          <Route path="*" element={<NavBar />} />
        </Routes>

        <Routes>
          {/* Landing page (only page without NavBar) */}
          <Route exact path="/" element={<LandingPage />} />

          {/* Public routes */}
          <Route path="/analyze" element={<HateSpeechDetector />} />
          <Route path="/login" element={<Login />} />

          {/* Protected route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;