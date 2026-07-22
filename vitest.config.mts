import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['tests/e2e/**', 'node_modules/**'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'lib/content/content-guard.ts',
        'lib/content/fallback-content.ts',
        'lib/content/repository.ts',
        'lib/content/supabase-adapter.ts',
        'lib/validation/forms.ts',
        'app/actions/forms.ts',
        'components/detail/seo.tsx',
        'components/animation/useReducedMotionPreference.ts',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
})
