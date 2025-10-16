import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { FORCE_REBUILD_TOKEN, reactVersion } from './forceRebuild'

// Diagnostic: Check for duplicate React instances
import { version } from 'react'
console.log('Force rebuild:', FORCE_REBUILD_TOKEN)
console.log('React version:', version, reactVersion)
console.log('React instance:', React)

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error('#root element not found');

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
