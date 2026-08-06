import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success) {
            setUser(res.data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (e) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (username, email, password) => {
    const res = await api.register(username, email, password);
    if (res.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const setGuestUser = (username) => {
    const guestObj = {
      _id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: username || 'Guest User',
      isGuest: true,
    };
    setUser(guestObj);
    return guestObj;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setGuestUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
