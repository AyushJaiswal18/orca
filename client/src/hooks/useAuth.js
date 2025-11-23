/**
 * useAuth Hook
 * React hook for authentication state and operations
 */

import { useState, useEffect } from 'react';
import { userService } from '../services/api.service.js';
import { getUser, isAuthenticated, clearAuth } from '../utils/token.utils.js';

/**
 * Custom hook for authentication
 * @returns {object} Auth state and methods
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (isAuthenticated()) {
          const userData = getUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login function
   * @param {object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   */
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.login(credentials);
      setUser(data.user);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register function
   * @param {object} userData - User registration data
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.register(userData);
      setUser(data.user);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      setLoading(true);
      await userService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      clearAuth();
      setLoading(false);
    }
  };

  /**
   * Update user data
   * @param {object} userData - Updated user data
   */
  const updateUser = (userData) => {
    setUser(userData);
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };
};

export default useAuth;

