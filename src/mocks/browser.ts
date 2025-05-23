import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Создаем и экспортируем воркер
export const worker = setupWorker(...handlers);