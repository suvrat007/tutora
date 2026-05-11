import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Capture install prompt before React mounts — the event can fire before any useEffect runs
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.__pwaInstallPrompt = e
})
import App from './App.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import ToastProvider from './components/ui/Toast.jsx';
import PWAUpdatePrompt from './components/ui/PWAUpdatePrompt.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ErrorBoundary>
        <App />
        <ToastProvider />
        <PWAUpdatePrompt />
      </ErrorBoundary>
    </GoogleOAuthProvider>
  </StrictMode>,
)
