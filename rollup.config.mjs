import { terser } from 'rollup-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

export default [
	{
		input: 'index.js',
		output: {
			file: 'dist/button.esm.js',
			format: 'esm',
			name: 'EchoButton'
		},
		plugins: [
			json(),
			commonjs(),
			nodeResolve({
				browser: true
			}),
			terser({})
		]
	},
	{
		input: 'index.js',
		output: {
			file: 'dist/button.min.js',
			format: 'umd',
			exports: 'default',
			name: 'EchoButton'
		},
		plugins: [
			json(),
			commonjs(),
			nodeResolve({
				browser: true
			}),
			terser({})
		]
	}
]
