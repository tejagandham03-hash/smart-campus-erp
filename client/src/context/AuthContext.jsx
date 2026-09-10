import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('sessionUser');
    if (savedToken) {
      setToken(savedToken);
      API.defaults.headers.Authorization = `Bearer ${savedToken}`;
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthLoading(false);
        } catch {
          localStorage.removeItem('sessionUser');
          fetchUser(savedToken);
        }
      } else {
        fetchUser(savedToken);
      }
    } else {
      setIsAuthLoading(false);
    }
  }, []);

  const fetchUser = async (authToken) => {
    try {
      const response = await API.get('/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(response.data.data);
      localStorage.setItem('sessionUser', JSON.stringify(response.data.data));
    } catch (error) {
      if (error.response?.status === 401) {
        console.error('Failed to fetch user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('sessionUser');
        setToken(null);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const login = async (email, password, role) => {
    try {
      const response = await API.post('/auth/login', { email, password, role });
      const { token: newToken, user: userData } = response.data.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('sessionUser', JSON.stringify(userData));
      API.defaults.headers.Authorization = `Bearer ${newToken}`;
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (formData) => {
    try {
      const response = await API.post('/auth/register', formData);
      const { token: newToken, user: userData } = response.data.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('sessionUser', JSON.stringify(userData));
      API.defaults.headers.Authorization = `Bearer ${newToken}`;
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('sessionUser');
    delete API.defaults.headers.Authorization;
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
