import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import pluginJs from '@eslint/js';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: { js },
        extends: ['js/recommended'],
    },
    { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
    pluginJs.configs.recommended,
    eslintPluginPrettier,
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: { globals: globals.node },
    },
    {
        rules: {
            'no-unused-vars': 'warn',
            'arrow-body-style': ['error', 'always'],
            'capitalized-comments': ['off', 'always'],
        },
    },
]);
