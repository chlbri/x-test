import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // globals: true,
    coverage: {
      enabled: true,
      extension: '.ts',
      exclude: ['src/fixtures/fetchNews/functions.ts'],
      // all: true,
    },
  },
});
