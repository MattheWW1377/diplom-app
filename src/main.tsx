import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { worker } from './mocks/browser';

// Функция для инициализации приложения
async function initApp() {
  if (import.meta.env.DEV) {
    try {
      await worker.start({
        onUnhandledRequest: 'bypass',
      });
      
      console.log('%c[MSW] Mock Service Worker успешно запущен', 'color: #28a745; font-weight: bold;');
      console.log('%c[MSW] Все запросы будут обрабатываться моком', 'color: #17a2b8;');
    } catch (error) {
      console.error('%c[MSW] Ошибка при запуске Mock Service Worker:', 'color: #dc3545; font-weight: bold;');
      console.error(error);
    }
  }

  // Рендерим приложение только после инициализации MSW
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Запускаем инициализацию
initApp();