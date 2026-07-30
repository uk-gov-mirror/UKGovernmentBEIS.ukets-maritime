import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'projects/mrtm-api/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/testing/**',
        '**/*.spec.ts',
        '**/*mock*.ts',
        '**/main.ts',
        '**/environments/**',
        '**/*.routes.ts',
        '**/*.selectors.ts',
        '**/*.providers.ts',
        '**/*.payload-mutator.ts',
        '**/*.side-effect.ts',
        '**/*.flow-manager.ts',
      ],
    },
  },
});
