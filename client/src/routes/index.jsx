/**
 * Application Routes
 * Main routing configuration
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

// Lazy load pages (you can create these)
// import HomePage from '../pages/HomePage.jsx';
// import LoginPage from '../pages/LoginPage.jsx';
// import RegisterPage from '../pages/RegisterPage.jsx';
// import DashboardPage from '../pages/DashboardPage.jsx';
// import ProfilePage from '../pages/ProfilePage.jsx';

// For now, using placeholder components
const HomePage = () => <div>Home Page</div>;
const LoginPage = () => <div>Login Page</div>;
const RegisterPage = () => <div>Register Page</div>;
const DashboardPage = () => <div>Dashboard Page</div>;
const ProfilePage = () => <div>Profile Page</div>;
const NotFoundPage = () => <div>404 - Page Not Found</div>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <ErrorBoundary><NotFoundPage /></ErrorBoundary>,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;

