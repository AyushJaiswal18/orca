/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Token storage keys
  TOKEN_KEY: 'accessToken',
  REFRESH_TOKEN_KEY: 'refreshToken',
  USER_KEY: 'user',
};

export default API_CONFIG;

