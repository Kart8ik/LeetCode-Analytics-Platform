module.exports = {
  root: true,
  // Ignore test files and coverage artifacts for fast lint runs
  ignorePatterns: ['tests/**', 'coverage/**'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    // keep project rules conservative by default
  },
  overrides: [
    {
      // Relax rules for test files to reduce noise and allow pragmatic use of `any` and ts-ignores
      files: ['tests/**/*.ts', 'tests/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
        'no-empty': ['error', { 'allowEmptyCatch': true }],
      },
    },
  ],
}
