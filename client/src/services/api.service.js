/**
 * API Service
 * Centralized API service functions for making HTTP requests
 */

import axiosInstance from '../lib/axios.js';
import { setToken, setRefreshToken, setUser, clearAuth } from '../utils/token.utils.js';
import { getErrorMessage } from '../utils/errorHandler.js';

/**
 * User API Service
 */
export const userService = {
  /**
   * Register a new user
   * @param {object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.firstName - User first name
   * @param {string} userData.lastName - User last name
   * @returns {Promise<object>} User data and tokens
   */
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/users/register', userData);
      const { data } = response.data;
      
      // Store tokens and user data
      if (data.token) setToken(data.token);
      if (data.refreshToken) setRefreshToken(data.refreshToken);
      if (data.user) setUser(data.user);
      
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Login user
   * @param {object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<object>} User data and tokens
   */
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/users/login', credentials);
      const { data } = response.data;
      
      // Store tokens and user data
      if (data.token) setToken(data.token);
      if (data.refreshToken) setRefreshToken(data.refreshToken);
      if (data.user) setUser(data.user);
      
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      await axiosInstance.post('/users/logout');
    } catch (error) {
      // Even if logout fails on server, clear local auth
      console.error('Logout error:', error);
    } finally {
      // Always clear local authentication data
      clearAuth();
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<object>} User data
   */
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/users/profile');
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update user profile
   * @param {object} userData - Updated user data
   * @returns {Promise<object>} Updated user data
   */
  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.patch('/users/profile', userData);
      const { data } = response.data;
      
      // Update stored user data
      if (data) setUser(data);
      
      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

/**
 * Generic API helper functions
 */
export const apiService = {
  /**
   * Generic GET request
   * @param {string} endpoint - API endpoint
   * @param {object} params - Query parameters
   * @returns {Promise<any>} Response data
   */
  get: async (endpoint, params = {}) => {
    try {
      const response = await axiosInstance.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Generic POST request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body data
   * @returns {Promise<any>} Response data
   */
  post: async (endpoint, data = {}) => {
    try {
      const response = await axiosInstance.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Generic PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body data
   * @returns {Promise<any>} Response data
   */
  put: async (endpoint, data = {}) => {
    try {
      const response = await axiosInstance.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Generic PATCH request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body data
   * @returns {Promise<any>} Response data
   */
  patch: async (endpoint, data = {}) => {
    try {
      const response = await axiosInstance.patch(endpoint, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Generic DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<any>} Response data
   */
  delete: async (endpoint) => {
    try {
      const response = await axiosInstance.delete(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export default {
  user: userService,
  api: apiService,
};

