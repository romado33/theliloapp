// ---- ONE-TIME CACHE/SW CLEANUP (remove after one successful prod load) ----
if (typeof window !== 'undefined') {
  // Unregister all service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations?.().then(regs => {
      console.log('🧹 Unregistering', regs.length, 'service worker(s)');
      regs.forEach(r => r.unregister().catch(() => {}));
    }).catch(() => {});
  }
  // Clear any caches the SW left behind
  // @ts-ignore
  if (window.caches?.keys) {
    // @ts-ignore
    caches.keys().then(keys => {
      console.log('🗑️ Deleting', keys.length, 'cache(s):', keys);
      return Promise.all(keys.map(k => caches.delete(k)));
    }).catch(() => {});
  }
}
// ---------------------------------------------------------------------------

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initErrorMonitoring } from './lib/errorMonitoring'

// Initialize error monitoring for production
initErrorMonitoring();

// Diagnostic logging (only in development)
if (import.meta.env.DEV) {
  console.info('🏗️ BUILD_ID:', import.meta.env.VITE_BUILD_ID);
  console.info('⚛️ React version:', React.version);
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

const el = document.getElementById('root');
if (!el) throw new Error('#root not found');

createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
