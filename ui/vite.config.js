import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import FullReload from 'vite-plugin-full-reload'
import { existsSync } from 'node:fs';

// references-html.mjs is gitignored, so only load it when it's there.
const referencesScript = new URL('./scripts/references-html.mjs', import.meta.url);

export default defineConfig(async () => ({
    plugins: [react(), FullReload(["./src/**/*.jsx", "./src/**/*.js", "./src/**/*.css"]), ...(existsSync(referencesScript) ? [(await import(referencesScript.href)).referencesHtml()] : [])],
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
}));
