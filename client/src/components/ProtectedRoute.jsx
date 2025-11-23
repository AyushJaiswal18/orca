/**
 * Protected Route Component
 * Wraps routes that require authentication
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

/**
 * ProtectedRoute - Route guard for authenticated pages
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {boolean} props.requireAuth - Whether authentication is required (default: true)
 * @param {string} props.redirectTo - Path to redirect if not authenticated (default: '/login')
 * @returns {React.ReactNode}
 */
export const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Redirect if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

