/**
 * Axios Instance with Automatic Token Handling
 * Configured axios instance with request/response interceptors
 */

import axios from 'axios';
import { API_CONFIG } from '../config/api.config.js';
import { getToken, getRefreshToken, setToken, setRefreshToken, clearAuth } from '../utils/token.utils.js';
import { isAuthError } from '../utils/errorHandler.js';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to true if using cookies
});

/**
 * Request Interceptor
 * Automatically adds authorization token to requests
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = getToken();
    
    // Add token to Authorization header if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles token expiration and automatic refresh
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Return successful response as-is
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (isAuthError(error) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = getRefreshToken();
      
      // Try to refresh token if refresh token exists
      if (refreshToken) {
        try {
          // Call refresh token endpoint
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}/users/refresh-token`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          
          const { data } = response.data;
          
          // Update tokens
          if (data.token) setToken(data.token);
          if (data.refreshToken) setRefreshToken(data.refreshToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear auth and redirect to login
          clearAuth();
          
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, clear auth and redirect to login
        clearAuth();
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

export default axiosInstance;
