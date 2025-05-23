import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { worker } from './mocks/browser';

// Запускаем MSW только в режиме разработки
if (import.meta.env.DEV) {
  worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
    waitUntilReady: true, // Ждем готовности сервис-воркера
  })
    .then(() => {
      console.log('%c[MSW] Mock Service Worker успешно запущен', 'color: #28a745; font-weight: bold;');
      console.log('%c[MSW] Все запросы будут обрабатываться моком', 'color: #17a2b8;');
    })
    .catch((error) => {
      console.error('%c[MSW] Ошибка при запуске Mock Service Worker:', 'color: #dc3545; font-weight: bold;');
      console.error(error);
    });

  // Добавляем слушатель для отлова ошибок в работе MSW
  worker.events.on('unhandledException', ({ error, request }) => {
    console.error(
      '%c[MSW] Необработанная ошибка при обработке запроса:',
      'color: #dc3545; font-weight: bold;',
      '\nЗапрос:', request.method, request.url,
      '\nОшибка:', error
    );
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);