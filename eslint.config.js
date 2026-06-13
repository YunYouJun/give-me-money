// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  ignores: [
    'dist/**',
    'docs/superpowers/plans/**',
    'node_modules/**',
    '.vite-ssg-dist/**',
    '.vite-ssg-temp/**',
    'auto-imports.d.ts',
    'components.d.ts',
    'src/components.d.ts',
  ],
})
