# Quick Start Guide

This guide will help you get started with the template quickly.

## What's New

The template now includes:

### ✅ Core Features
- **Protected Routes** - Route guards for authenticated pages
- **Error Boundaries** - Graceful error handling
- **Toast Notifications** - User feedback system
- **Loading States** - Reusable loading components
- **Refresh Tokens** - Automatic token refresh
- **React Router** - Complete routing setup

## Quick Setup

1. **Copy environment files**
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

2. **Install dependencies**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

3. **Start development**
   ```bash
   # Terminal 1
   cd server && npm run dev
   
   # Terminal 2
   cd client && npm run dev
   ```

## Using the New Features

### Protected Routes

```jsx
import { ProtectedRoute } from './components/ProtectedRoute';

<ProtectedRoute>
  <YourProtectedPage />
</ProtectedRoute>
```

### Toast Notifications

```jsx
import { useToast } from './contexts/ToastContext';

const { success, error } = useToast();
success('Operation successful!');
error('Something went wrong');
```

### Loading States

```jsx
import { Spinner, FullPageLoading } from './components/Loading';

<Spinner />
{loading && <FullPageLoading message="Loading..." />}
```

### Error Boundary

Already integrated in `App.jsx`. Wraps the entire application.

## Next Steps

1. Create your page components in `client/src/pages/`
2. Update routes in `client/src/routes/index.jsx`
3. Customize toast styles if needed
4. Add more protected routes as needed

For more details, see [IMPROVEMENTS.md](./IMPROVEMENTS.md).

