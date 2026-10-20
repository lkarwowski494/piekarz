// ESLint (flat config) [M1-audytor-generalny-063; 08-programista-018]
// Zestaw: @eslint/js recommended + typescript-eslint recommended (typescript-eslint.io/getting-started,
// odczyt 2026-10-20) i dwie reguły hooków z eslint-plugin-react-hooks (react.dev/reference/eslint-plugin-react-hooks).
// Zakres: kod produkcyjny w app/ i src/ (skrypt `npm run lint`).
const js = require('@eslint/js');
const { defineConfig, globalIgnores } = require('eslint/config');
const tseslint = require('typescript-eslint');
const reactHooks = require('eslint-plugin-react-hooks');

module.exports = defineConfig([
  globalIgnores([
    'audit/**',
    '.claude/**',
    'node_modules/**',
    'docs/**',
    'dist/**',
    'web-build/**',
    'coverage/**',
    'reports/**',
    '.expo/**',
    '.stryker-tmp/**',
    'ios/**',
    'android/**',
    // Testy poza zakresem lintu: osobne zadanie później, decyzja właściciela 2026-10-20
    // [M1-audytor-generalny-063]. Dotyczy katalogów __tests__ i plików *.test.ts(x).
    '**/__tests__/**',
    '**/*.test.{ts,tsx}',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]);
