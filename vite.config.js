import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    root: 'src/frontend',
    base: './',
    build: {
        outDir: '../../static',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'src/frontend/index.html'),
            },
        },
    },
});
