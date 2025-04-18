import type { ViteDevServer } from 'vite'; // Импортируем тип ViteDevServer

export default function mimePlugin() {
  return {
    name: 'mime-plugin',
    configureServer(server: ViteDevServer) { // Указываем тип для server
      server.middlewares.use((req, res, next) => {
        if (req.url === '/mockServiceWorker.js' || req.url?.endsWith('mockServiceWorker.js')) {
          res.setHeader('Content-Type', 'application/javascript');
          res.setHeader('Service-Worker-Allowed', '/');
        }
        next();
      });
    },
  };
}