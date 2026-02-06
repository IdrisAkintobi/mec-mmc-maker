import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: ['**/*.{js,mjs,cjs,ts}'],
        languageOptions: {
            globals: globals.node,
            parser: '@typescript-eslint/parser',
            parserOptions: {
                sourceType: 'module',
            },
        },
        rules: {
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
        ignores: ['.eslintrc.js', 'node_modules/', 'dist/', 'coverage/'],
    },
    ...tseslint.configs.recommended,
];
