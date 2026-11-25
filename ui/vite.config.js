import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import FullReload from 'vite-plugin-full-reload'
import { referencesHtml } from './scripts/references-html.mjs';

export default defineConfig({
    plugins: [react(), FullReload(["./src/**/*.jsx", "./src/**/*.js", "./src/**/*.css"]), referencesHtml()],
    server: {
        host: true,
        open: false,
        port: 3000,
        allowedHosts: true,
        proxy: {
            '/api': {
                target: process.env.API_PROXY_TARGET || 'http://127.0.0.1:4000',
                changeOrigin: true,
            },
        },
        watch: {
            usePolling: true,
        },
    },
    build: {
        outDir: 'build',
    },
});