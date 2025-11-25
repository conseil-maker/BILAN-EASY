import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Gestion d'erreur globale
window.addEventListener('error', (event) => {
  console.error('Erreur globale:', event.error);
  document.body.innerHTML = `
    <div style="padding: 50px; font-family: Arial;">
      <h1 style="color: red;">❌ Erreur Runtime</h1>
      <p><strong>Message:</strong> ${event.error?.message || 'Erreur inconnue'}</p>
      <p><strong>Stack:</strong></p>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${event.error?.stack || 'Pas de stack trace'}</pre>
    </div>
  `;
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejetée:', event.reason);
  document.body.innerHTML = `
    <div style="padding: 50px; font-family: Arial;">
      <h1 style="color: red;">❌ Promise Rejetée</h1>
      <p><strong>Raison:</strong> ${event.reason?.message || event.reason}</p>
    </div>
  `;
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error: any) {
  console.error('Erreur lors du rendu:', error);
  rootElement.innerHTML = `
    <div style="padding: 50px; font-family: Arial;">
      <h1 style="color: red;">❌ Erreur de Rendu</h1>
      <p><strong>Message:</strong> ${error.message}</p>
      <pre style="background: #f5f5f5; padding: 10px;">${error.stack}</pre>
    </div>
  `;
}
