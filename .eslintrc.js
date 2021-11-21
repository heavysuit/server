module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'google',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.dev.json'],
    sourceType: 'module',
  },
  ignorePatterns: [
    '/lib/**/*', // Ignore built files.
    '/build/**/*',
    '.eslintrc.js',
    '/src/generated/**/*',
    'babel.config.js',
  ],
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    quotes: ['error', 'single'],
    indent: 0,
    'object-curly-spacing': 0,
    'require-jsdoc': 0,
    'max-len': 0,
    '@typescript-eslint/no-namespace': 0,
    '@typescript-eslint/no-empty-interface': 0,
    'space-before-function-paren': 0,
    'operator-linebreak': 0,
    'new-cap': 0,
    camelcase: 0,
  },
};
