import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';

export default [
	{
		input: ['data.js', 'debug.js', 'display.js', 'string.js', 'vocab.js'],
		output: [
			{
				dir: 'dist',
				format: 'es',
				preserveModules: true,
				preserveModulesRoot: 'src'
			}
		],
		plugins: [nodeResolve(), commonjs(), json(), babel({ babelHelpers: 'bundled' })],
		external: ['lodash-es', 'sjcl']
	}
];
