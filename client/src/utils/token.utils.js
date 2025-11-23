/**
 * Token Utility Functions
 * Handles token storage and retrieval from localStorage
 */

import { API_CONFIG } from '../config/api.config.js';

/**
 * Get access token from localStorage
 * @returns {string|null} Access token or null if not found
 */
export const getToken = () => {
  try {
    return localStorage.getItem(API_CONFIG.TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Get refresh token from localStorage
 * @returns {string|null} Refresh token or null if not found
 */
export const getRefreshToken = () => {
  try {
    return localStorage.getItem(API_CONFIG.REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Set access token in localStorage
 * @param {string} token - Access token to store
 */
export const setToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
    } else {
      localStorage.removeItem(API_CONFIG.TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

/**
 * Set refresh token in localStorage
 * @param {string} refreshToken - Refresh token to store
 */
export const setRefreshToken = (refreshToken) => {
  try {
    if (refreshToken) {
      localStorage.setItem(API_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error setting refresh token:', error);
  }
};

/**
 * Set user data in localStorage
 * @param {object} user - User object to store
 */
export const setUser = (user) => {
  try {
    if (user) {
      localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(API_CONFIG.USER_KEY);
    }
  } catch (error) {
    console.error('Error setting user:', error);
  }
};

/**
 * Get user data from localStorage
 * @returns {object|null} User object or null if not found
 */
export const getUser = () => {
  try {
    const user = localStorage.getItem(API_CONFIG.USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuth = () => {
  try {
    localStorage.removeItem(API_CONFIG.TOKEN_KEY);
    localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_KEY);
    localStorage.removeItem(API_CONFIG.USER_KEY);
  } catch (error) {
    console.error('Error clearing auth:', error);
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export const isAuthenticated = () => {
  return !!getToken();
};

