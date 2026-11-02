import typescript from "@rollup/plugin-typescript"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import { lezer } from "@lezer/generator/rollup"
import terser from '@rollup/plugin-terser';

export default [
	{
		input: "src/editor.mjs",
		output: [
			{ dir: "../codewithrockstar.com/js/codemirror", format: "es" },
			{ dir: "./test/parser", format: "es" }
		],
		plugins: [lezer(), nodeResolve(), typescript({ include: ["src/**/*.ts"], declaration: false }), terser()]
	}
]
