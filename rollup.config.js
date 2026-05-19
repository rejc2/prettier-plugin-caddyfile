import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';

const external = [/^node:/, 'prettier'];

export default [
	{
		input: 'src/index.ts',
		output: {
			file: 'dist/index.js',
			format: 'esm',
			sourcemap: true,
		},
		external,
		plugins: [
			replace({
				preventAssignment: true,
				values: {
					'process.env.VITEST': 'false',
				},
			}),
			typescript({
				tsconfig: './tsconfig.json',
				compilerOptions: {
					noEmit: false,
					declaration: false,
					declarationMap: false,
					sourceMap: true,
				},
				exclude: ['**/*.test.ts', 'eslint.config.ts'],
			}),
		],
	},
	{
		input: 'src/index.ts',
		output: {
			file: 'dist/index.d.ts',
			format: 'esm',
		},
		external,
		plugins: [dts({ tsconfig: './tsconfig.json' })],
	},
];
