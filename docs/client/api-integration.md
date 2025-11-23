# API Integration Guide

This guide explains how to use the API integration setup with automatic token handling.

## Overview

The API integration includes:
- **Automatic token management** - Tokens are automatically added to requests
- **Token storage** - Tokens stored in localStorage
- **Error handling** - Automatic logout on 401 errors
- **React hooks** - Easy-to-use hooks for authentication and API calls

## File Structure

```
client/src/
├── config/
│   └── api.config.js          # API configuration
├── lib/
│   └── axios.js               # Axios instance with interceptors
├── services/
│   └── api.service.js         # API service functions
├── utils/
│   ├── token.utils.js         # Token management utilities
│   └── errorHandler.js        # Error handling utilities
├── hooks/
│   ├── useAuth.js             # Authentication hook
│   └── useApi.js              # Generic API hook
└── examples/
    └── ApiUsageExample.jsx    # Usage examples
```

## Quick Start

### 1. Using the useAuth Hook

```jsx
import { useAuth } from './hooks/useAuth';

function LoginComponent() {
  const { login, loading, error, user, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
      // User is now logged in, token is automatically stored
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  if (isAuthenticated) {
    return <div>Welcome, {user.firstName}!</div>;
  }

  return (
    <button onClick={handleLogin} disabled={loading}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  );
}
```

### 2. Using API Service Directly

```jsx
import { userService } from './services/api.service';

async function fetchUserProfile() {
  try {
    const user = await userService.getProfile();
    console.log('User profile:', user);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### 3. Using Generic API Calls

```jsx
import { apiService } from './services/api.service';

// GET request
const data = await apiService.get('/users/profile');

// POST request
const result = await apiService.post('/users/register', {
  email: 'user@example.com',
  password: 'password',
  firstName: 'John',
  lastName: 'Doe',
});

// PUT request
await apiService.put('/users/profile', { firstName: 'Jane' });

// PATCH request
await apiService.patch('/users/profile', { lastName: 'Smith' });

// DELETE request
await apiService.delete('/users/profile');
```

### 4. Using useApi Hook

```jsx
import { useApi } from './hooks/useApi';
import { apiService } from './services/api.service';

function DataComponent() {
  const { data, loading, error, execute } = useApi(apiService.get);

  const fetchData = () => {
    execute('/health');
  };

  return (
    <div>
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
      {error && <div>Error: {error}</div>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

## Configuration

### Environment Variables

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

### API Configuration

Edit `src/config/api.config.js` to customize:
- Base URL
- Request timeout
- Token storage keys

## Token Management

Tokens are automatically:
- **Stored** when you login/register
- **Added** to all API requests
- **Cleared** when you logout or receive a 401 error

### Manual Token Management

```jsx
import { getToken, setToken, clearAuth, isAuthenticated } from './utils/token.utils';

// Get current token
const token = getToken();

// Check if authenticated
if (isAuthenticated()) {
  console.log('User is authenticated');
}

// Clear all auth data
clearAuth();
```

## Error Handling

Errors are automatically handled:
- **401 errors** - Automatically logs out and redirects to login
- **Network errors** - User-friendly error messages
- **Server errors** - Proper error messages from API

### Custom Error Handling

```jsx
import { getErrorMessage, isAuthError, isServerError } from './utils/errorHandler';

try {
  await userService.getProfile();
} catch (error) {
  const message = getErrorMessage(error);
  
  if (isAuthError(error)) {
    // Handle authentication error
  } else if (isServerError(error)) {
    // Handle server error
  } else {
    // Handle other errors
  }
}
```

## Available Services

### User Service

```jsx
import { userService } from './services/api.service';

// Register
await userService.register({
  email: 'user@example.com',
  password: 'password',
  firstName: 'John',
  lastName: 'Doe',
});

// Login
await userService.login({
  email: 'user@example.com',
  password: 'password',
});

// Logout
await userService.logout();

// Get profile
const profile = await userService.getProfile();

// Update profile
await userService.updateProfile({
  firstName: 'Jane',
  lastName: 'Smith',
});
```

## Best Practices

1. **Use hooks** - Prefer `useAuth` and `useApi` hooks for React components
2. **Handle errors** - Always wrap API calls in try-catch blocks
3. **Loading states** - Use loading states from hooks for better UX
4. **Error messages** - Display user-friendly error messages
5. **Token security** - Never expose tokens in client-side code

## Examples

See `client/src/examples/ApiUsageExample.jsx` for complete usage examples.

