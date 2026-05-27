import js from '@eslint/js';

export default [
  {
    ignores: ['node_modules', 'dist', 'build', '.env*'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': ['warn'],
    },
  },
];
