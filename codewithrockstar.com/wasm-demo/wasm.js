import { dotnet } from '/wasm/wwwroot/_framework/dotnet.js'

const { setModuleImports, getAssemblyExports, getConfig } = await dotnet
    .withDiagnosticTracing(false)
    .withApplicationArgumentsFromQuery()
    .create();

const config = getConfig();
const exports = await getAssemblyExports(config.mainAssemblyName);
await dotnet.run();
var runButton = document.getElementById("runButton");
var sourceTextArea = document.getElementById("source");
var outputPre = document.getElementById("output");

runButton.addEventListener("click", function() {
	var source = sourceTextArea.value;
	console.log(source);
	try {
	var result = exports.Rockstar.Wasm.RockstarRunner.Run(source);
	outputPre.innerText = result;
	} catch(e) {
		outputPre.innerText = e;
	}
});
