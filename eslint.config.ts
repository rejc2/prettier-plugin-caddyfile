import eslint from '@eslint/js';
import type { Linter } from 'eslint';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

const tsconfigRootDir = import.meta.dirname;

const config: Linter.Config[] = [
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		plugins: {
			import: importPlugin,
		},
		languageOptions: {
			parserOptions: {
				tsconfigRootDir,
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			'no-unused-private-class-members': 'warn',

			'prefer-const': ['warn', { ignoreReadBeforeAssign: true }],

			// TypeScript rules
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			'@typescript-eslint/consistent-type-imports': 'warn',

			'import/no-extraneous-dependencies': 'warn',
		},
	},
	{
		ignores: [
			'**/node_modules/**',
			'**/build/**',
			'**/dist/**',
			'**/generated/**',
			'**/playwright-report/**',
			'**/test-results/**',
		],
	},
];

export default config;
