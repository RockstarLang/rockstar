import { dotnet } from '../wasm/wwwroot/_framework/dotnet.js'
const { getAssemblyExports, getConfig } = await dotnet.withDiagnosticTracing(false).create();
const config = getConfig();
const exports = await getAssemblyExports(config.mainAssemblyName);
var status = await exports.Rockstar.Wasm.RockstarRunner.Status();
self.postMessage({ type: "ready", status: status });

function report(editorId) {
	return function (output) {
		self.postMessage({ type: "output", output: output, editorId: editorId })
	}
}
async function RunRockstarProgram(source, editorId, stdin) {
	console.log(stdin);
	try {
		var result = await exports.Rockstar.Wasm.RockstarRunner.Run(source, report(editorId), stdin);
		self.postMessage({ type: "result", result: result, editorId: editorId });
	} catch (error) {
		self.postMessage({ type: "error", error: error, editorId: editorId })
	}
}

async function ParseRockstarProgram(source, editorId) {
	try {
		var result = await exports.Rockstar.Wasm.RockstarRunner.Parse(source, report(editorId));
		self.postMessage({ type: "parse", result: result, editorId: editorId });
	} catch (error) {
		self.postMessage({ type: "error", error: error, editorId: editorId })
	}
}


self.addEventListener('message', async function (message) {
	var data = message.data;
	if (data.program) {
		switch(data.command) {
			case "run": return await RunRockstarProgram(data.program, data.editorId, data.input);
			case "parse": return await ParseRockstarProgram(data.program, data.editorId);
		}
	} else {
		self.postMessage({ type: "error", error: "empty program!", editorId: data.editorId })
	}
});