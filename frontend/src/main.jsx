import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import ToastProvider from './components/ui/Toast.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ErrorBoundary>
        <App />
        <ToastProvider />
      </ErrorBoundary>
    </GoogleOAuthProvider>
  </StrictMode>,
)
