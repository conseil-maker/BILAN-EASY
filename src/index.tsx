import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './animations.css';
import './i18n'; // Initialiser i18n pour le multilingue

// Initialiser Sentry pour le monitoring des erreurs
import { initSentry } from './lib/sentry';
initSentry();

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
