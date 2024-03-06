// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        cors: true, // Habilita CORS para cualquier origen
        // O bien, puedes especificar un origen específico:
        // cors: { origin: 'http://mi-sitio.com' }
    },
});