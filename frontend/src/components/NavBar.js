import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './App.css';

function NavBar() {
  const { redditAuth } = useContext(AuthContext);
  const API_URL = 'http://localhost:8000';

  const handleRedditLogin = () => {
    window.location.href = `${API_URL}/login/reddit`;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logiya.png" alt="Company Logo" className="logo-img" />
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-links">تحليل نص يدوي</Link>
          </li>
          <li className="nav-item">
            <Link to="/Dashboard" className="nav-links">لوحة القيادة</Link>
          </li>
          {!redditAuth.isAuthenticated && (
            <li className="nav-item">
              <button className="reddit-login-btn" onClick={handleRedditLogin}>
                تسجيل الدخول عبر ريديت
              </button>
            </li>
          )}
         
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;