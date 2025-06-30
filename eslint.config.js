import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'

const tabIndent = 4

export default [
    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
                myCustomGlobal: 'readonly',
            },
        },
        rules: {
            'max-len': ['error', { code: 170 }],
            indent: ['error', tabIndent],
            semi: ['error', 'never'],
            quotes: ['error', 'single'],
            'comma-dangle': ['error', {
                objects: 'always-multiline',
                arrays: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'always-multiline',
            }],
            'no-trailing-spaces': 'error',
            'eol-last': ['error', 'always'],
            'no-magic-numbers': ['error', {
                ignore: [-1, 0, 1],
                ignoreArrayIndexes: true,
                ignoreDefaultValues: true,
            }],
            'no-console': process.env.NODE_ENV === 'production' ? 'error' : 0,
            'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 0,
            'no-param-reassign': 0,
            'global-require': 0,
            'import/extensions': 0,
            'import/no-unresolved': 0,
            'no-restricted-globals': ['error', 'event'],
            'func-names': ['error', 'never'],
            // Vue-specific rules
            'vue/html-indent': ['error', tabIndent],
            'vue/script-indent': ['error', tabIndent, { baseIndent: 0 }],
            'vue/no-unused-vars': 'error',
            'vue/order-in-components': 'error',
            'vue/this-in-template': 'error',
            'vue/no-v-html': 'off',
            'vue/require-default-prop': 'off',
            'vue/multi-word-component-names': 'off',
            'vue/html-self-closing': ['error', {
                html: {
                    void: 'never',
                    normal: 'always',
                    component: 'always',
                },
                svg: 'always',
                math: 'always',
            }],
        },
    },
    {
        files: ['**/*.vue'],
        rules: {
            'indent': 'off',
            'vue/script-indent': ['error', tabIndent, { baseIndent: 0 }],
        },
    },
    {
        ignores: [
            'dist/**',
        ],
    },
]
