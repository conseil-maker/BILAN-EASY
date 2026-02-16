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
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('[App] Erreur critique lors du montage React:', error);
    rootElement.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;text-align:center;padding:20px;">
        <div>
          <h1 style="color:#4f46e5;">Bilan de Compétences IA</h1>
          <p style="color:#666;">Une erreur est survenue lors du chargement de l'application.</p>
          <button onclick="window.location.reload()" style="margin-top:16px;padding:8px 24px;background:#4f46e5;color:white;border:none;border-radius:8px;cursor:pointer;">
            Recharger la page
          </button>
        </div>
      </div>
    `;
  }
} else {
  console.error('[App] Élément root non trouvé dans le DOM');
}
