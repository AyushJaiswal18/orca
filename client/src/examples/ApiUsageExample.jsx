/**
 * API Usage Examples
 * Example components demonstrating how to use the API integration
 */

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { userService, apiService } from '../services/api.service.js';
import { useApi } from '../hooks/useApi.js';

/**
 * Example: Login Component using useAuth hook
 */
export const LoginExample = () => {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      // Redirect or show success message
      console.log('Login successful!');
    } catch (err) {
      // Error is already handled by useAuth hook
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

/**
 * Example: Register Component using useAuth hook
 */
export const RegisterExample = () => {
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      // Redirect or show success message
      console.log('Registration successful!');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="First Name"
        value={formData.firstName}
        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

/**
 * Example: Using API service directly
 */
export const DirectApiExample = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Example: Fetch user profile
      const result = await userService.getProfile();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Profile'}
      </button>
      {error && <div className="error">Error: {error}</div>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};

/**
 * Example: Using useApi hook for generic API calls
 */
export const UseApiHookExample = () => {
  const { data, loading, error, execute } = useApi(apiService.get);

  const fetchHealthCheck = () => {
    execute('/health');
  };

  return (
    <div>
      <button onClick={fetchHealthCheck} disabled={loading}>
        {loading ? 'Loading...' : 'Check Health'}
      </button>
      {error && <div className="error">Error: {error}</div>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};

/**
 * Example: Protected Component
 */
export const ProtectedExample = () => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login to view this content.</div>;
  }

  return (
    <div>
      <h2>Welcome, {user?.firstName}!</h2>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

