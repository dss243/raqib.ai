import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [redditAuth, setRedditAuth] = useState({
    isAuthenticated: false,
    token: null,
    user: null
  });

  const API_URL = 'http://localhost:8000';

  const exchangeRedditCode = async (code) => {
    try {
      const response = await axios.get(`${API_URL}/auth/callback?code=${code}`);
      setRedditAuth({
        isAuthenticated: true,
        token: response.data.access_token,
        user: response.data.user || null
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      console.error("OAuth Error:", err);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) exchangeRedditCode(code);
  }, []);

  return (
    <AuthContext.Provider value={{ redditAuth, setRedditAuth }}>
      {children}
    </AuthContext.Provider>
  );
};