// Proxy SOLO de desarrollo (ARQUITECTURA §11.1): /incomes → :8001 y
// /expenses → :8002. El bypass distingue navegaciones del navegador
// (Accept: text/html → servir la SPA) de llamadas del API (→ proxy),
// porque las rutas del Router comparten path con los recursos REST.
const spaBypass = (req) =>
  req.headers.accept?.includes('text/html') ? '/index.html' : null;

export default {
  '/incomes': {
    target: 'http://localhost:8001',
    secure: false,
    changeOrigin: true,
    bypass: spaBypass,
  },
  '/expenses': {
    target: 'http://localhost:8002',
    secure: false,
    changeOrigin: true,
    bypass: spaBypass,
  },
};
