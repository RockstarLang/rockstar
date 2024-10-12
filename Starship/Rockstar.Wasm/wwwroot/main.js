import { dotnet } from './_framework/dotnet.js'

const { setModuleImports, getAssemblyExports, getConfig } = await dotnet
    .withDiagnosticTracing(false)
    .withApplicationArgumentsFromQuery()
    .create();

const config = getConfig();
const exports = await getAssemblyExports(config.mainAssemblyName);
console.log(exports);
await dotnet.run();

export function RunRockstarProgram(source) {
	return exports.Rockstar.Wasm.RockstarRunner.Run(source);
}