const globals = require('globals');
const tseslint = require('@typescript-eslint/eslint-plugin');
const parser = require('@typescript-eslint/parser');
const pluginReact = require('eslint-plugin-react');
const hooksPlugin = require('eslint-plugin-react-hooks');
const nextPlugin = require('@next/eslint-plugin-next');

module.exports = [
  {
    ignores: [
      '.next/**',
      'eslint.config.cjs',
      'jest.config.js',
      'jest.setup.js',
      'test-env.js',
      'next.config.js',
      'postcss.config.js',
      'tailwind.config.ts',
      'tsconfig.json',
      'package.json',
      'package-lock.json',
      'README.md',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint,
      react: pluginReact,
      'react-hooks': hooksPlugin,
      '@next/next': nextPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: parser,
      parserOptions: {
        project: true,
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]; 