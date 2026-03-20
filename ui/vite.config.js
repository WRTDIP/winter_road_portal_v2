import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import FullReload from 'vite-plugin-full-reload'

export default defineConfig({
    plugins: [react(), FullReload(["./src/**/*.jsx", "./src/**/*.js"])],
    server: {
        host: true,
        open: false,
        port: 3000,
        watch: {
            usePolling: true,
        },
    },
    build: {
        outDir: 'build',
    },
});