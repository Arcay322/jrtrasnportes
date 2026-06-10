import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginReact from 'eslint-plugin-react';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  // Ignore output/cache folders
  {
    ignores: ['dist/**', '.vercel/**', '.astro/**', 'node_modules/**', 'docs/**']
  },
  // Base JS/TS/React Configuration
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    plugins: {
      react: eslintPluginReact,
      '@typescript-eslint': tsPlugin
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off'
    }
  },
  // Astro Configuration
  ...eslintPluginAstro.configs.recommended
];
