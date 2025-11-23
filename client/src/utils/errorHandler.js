/**
 * Error Handler Utility
 * Handles API errors and provides user-friendly error messages
 */

/**
 * Extract error message from API error response
 * @param {Error} error - Axios error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Check if error has a response with data
  if (error?.response?.data) {
    const { message, error: errorMsg } = error.response.data;
    
    // Handle array of error messages
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    
    // Return message or error field
    return message || errorMsg || 'An error occurred';
  }
  
  // Handle network errors
  if (error?.message === 'Network Error' || !error?.response) {
    return 'Network error. Please check your internet connection.';
  }
  
  // Handle request timeout
  if (error?.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.';
  }
  
  // Default error message
  return error?.message || 'An unexpected error occurred';
};

/**
 * Get HTTP status code from error
 * @param {Error} error - Axios error object
 * @returns {number|null} HTTP status code or null
 */
export const getErrorStatus = (error) => {
  return error?.response?.status || null;
};

/**
 * Check if error is an authentication error (401)
 * @param {Error} error - Axios error object
 * @returns {boolean} True if error is 401
 */
export const isAuthError = (error) => {
  return getErrorStatus(error) === 401;
};

/**
 * Check if error is a forbidden error (403)
 * @param {Error} error - Axios error object
 * @returns {boolean} True if error is 403
 */
export const isForbiddenError = (error) => {
  return getErrorStatus(error) === 403;
};

/**
 * Check if error is a not found error (404)
 * @param {Error} error - Axios error object
 * @returns {boolean} True if error is 404
 */
export const isNotFoundError = (error) => {
  return getErrorStatus(error) === 404;
};

/**
 * Check if error is a server error (500+)
 * @param {Error} error - Axios error object
 * @returns {boolean} True if error is 500+
 */
export const isServerError = (error) => {
  const status = getErrorStatus(error);
  return status !== null && status >= 500;
};

