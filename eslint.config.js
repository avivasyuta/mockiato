import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
    {
        ignores: [
            'dist/',
            'build/',
            'coverage/',
            'playwright-report/',
            'test-results/',
            'node_modules/',
            'eslint.config.js',
        ],
    },
    {
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    react.configs.flat.recommended,
    react.configs.flat['jsx-runtime'],
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    jsxA11y.flatConfigs.recommended,
    // Disable stylistic rules that conflict with Prettier; keep this before the
    // project rules block so explicit overrides (e.g. max-len) still win.
    prettier,
    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            'react-hooks': reactHooks,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.browser,
                ...globals.webextensions,
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: false,
                },
            },
        },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'object-curly-newline': 'off',
            'max-len': ['error', 120],
            'no-console': 'warn',
            'no-unused-vars': 'off',
            'no-shadow': 'off',
            'arrow-body-style': 'off',
            'import/prefer-default-export': 'off',
            'import/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: [
                        'test/**',
                        'tests/**',
                        'spec/**',
                        '**/__tests__/**',
                        '**/__specs__/**',
                        '**/__mocks__/**',
                        'test.{js,jsx,ts,tsx}',
                        'test-*.{js,jsx,ts,tsx}',
                        '**/*{.,_}{test,spec}.{js,jsx,ts,tsx}',
                        '**/jest.config.js',
                        '**/jest.setup.js',
                        '**/vite.config.*',
                        '**/vitest.config.*',
                        '**/config/**',
                        '**/e2e/**',
                        '**/playwright.config.*',
                    ],
                    optionalDependencies: false,
                },
            ],
            'import/extensions': [
                'error',
                {
                    ts: 'never',
                    tsx: 'never',
                    json: 'always',
                },
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-shadow': ['error'],
            'react/require-default-props': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/function-component-definition': 'off',
            'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
            'react/jsx-props-no-spreading': 'off',
            'react/jsx-one-expression-per-line': 'off',
            'no-plusplus': 'off',
        },
    },
);
