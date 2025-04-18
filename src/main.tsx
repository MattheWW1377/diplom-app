import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { worker } from './mocks/browser';
import { AnswerProvider } from './context/AnswerContext';

// Используем import.meta.env вместо process.env
if (import.meta.env.MODE === 'development') {
  worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  }).then(() => {
    console.log('[MSW] Worker started');
  }).catch((error) => {
    console.error('[MSW] Failed to start worker:', error);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AnswerProvider>
      <App />
    </AnswerProvider>
  </React.StrictMode>
);