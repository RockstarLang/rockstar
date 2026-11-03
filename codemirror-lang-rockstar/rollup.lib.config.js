// Library build for the npm package: ESM + CJS + type declarations,
// with CodeMirror and Lezer left as external dependencies.
import typescript from "@rollup/plugin-typescript"
import { lezer } from "@lezer/generator/rollup"
import { dts } from "rollup-plugin-dts"

const external = id => /^@(codemirror|lezer)\//.test(id)

export default [
	{
		input: "src/index.ts",
		external,
		output: [
			{ file: "dist/index.js", format: "es" },
			{ file: "dist/index.cjs", format: "cjs" }
		],
		plugins: [lezer(), typescript({ include: ["src/**/*.ts"], declaration: false })]
	},
	{
		input: "src/index.ts",
		external,
		output: { file: "dist/index.d.ts", format: "es" },
		plugins: [dts()]
	}
]
