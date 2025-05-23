import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { worker } from './mocks/browser';

// Запускаем MSW только в режиме разработки
if (import.meta.env.DEV) {
  worker.start({
    onUnhandledRequest: 'bypass',
  }).catch((error) => {
    console.error('[MSW] Failed to start worker:', error);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);