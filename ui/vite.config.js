import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import FullReload from 'vite-plugin-full-reload'

export default defineConfig({
    plugins: [react(), FullReload(["./src/**/*.jsx", "./src/**/*.js", "./src/**/*.css"])],
    server: {
        host: true,
        open: false,
        port: 3000,
        allowedHosts: true,
        watch: {
            usePolling: true,
        },
    },
    build: {
        outDir: 'build',
    },
});