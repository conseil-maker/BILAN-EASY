import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './hooks/useTheme';

// Sentry is disabled for now - enable it later by adding VITE_SENTRY_DSN to .env.local
// if (import.meta.env.VITE_SENTRY_DSN) {
//   import('./sentry.client.config');
// }

// Clerk kaldırıldı - Basit session-based authentication kullanılıyor
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
