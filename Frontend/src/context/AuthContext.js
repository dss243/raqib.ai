import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    token: null,
    user: null,
    loading: true
  });

  const login = ({ token, user }) => {
    localStorage.setItem('redditAuth', JSON.stringify({ token, user }));
    setAuthState({
      isAuthenticated: true,
      token,
      user,
      loading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('redditAuth');
    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null,
      loading: false
    });
  };

  useEffect(() => {
    const storedAuth = localStorage.getItem('redditAuth');
    if (storedAuth) {
      try {
        const { token, user } = JSON.parse(storedAuth);
        login({ token, user });
      } catch (err) {
        logout();
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}