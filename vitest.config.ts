import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        silent: false,
        environment: 'node',
        include: ['**/*.test.ts', '**/*.spec.ts'],
        exclude: ['**/node_modules/**', '**/dist/**'],
        testTimeout: 10000,
        dir: './src/geoimage/tests',
    },
});
