import { RouterProvider } from 'react-router-dom'
import { ToastProvider } from './contexts/ToastContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { router } from './routes/index.jsx'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
