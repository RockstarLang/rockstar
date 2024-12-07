using System;
using System.Collections.Generic;
using System.Runtime.InteropServices.JavaScript;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Rockstar.Engine;

namespace Rockstar.Wasm;

public class WasmIO(Action<string> output, Queue<string> input) : IRockstarIO {
	public string? Read() => input.TryDequeue(out var s) ? s : null;
	public void Write(string s) => output(s);
	public void WriteLine(string s) => output(s + Environment.NewLine);
}

public partial class RockstarRunner {

	[JSExport]
	public static Task<string> Status() {
		var status = $"Rockstar (Starship {RockstarEnvironment.VERSION} on {System.Runtime.InteropServices.RuntimeInformation.RuntimeIdentifier})";
		Console.WriteLine(status);
		return Task.Run(() => status);
	}

	private static readonly Parser parser = new();

	[JSExport]
	public static Task<string> Run(string source,
		[JSMarshalAs<JSType.Function<JSType.String>>] Action<string> output, string? input = null, string? args = null) {
		Console.WriteLine("Running Rockstar program");
		var inputQueue = new Queue<string>((input ?? "").Split(Environment.NewLine));
		var argList = Regex.Split((args ?? ""), "\\s+");
		return Task.Run(() => {
			IRockstarIO io = new WasmIO(output, inputQueue);
			var env = new RockstarEnvironment(io, argList);
			try {
				var program = parser.Parse(source);
				var result = env.Execute(program);
				return result?.Value?.ToString() ?? "";
			} catch (ParserException ex) {
				io.WriteError(ex, source);
				return "";
			}
		});
	}

	[JSExport]
	public static Task<string> Parse(string source) {
		Console.WriteLine("Parsing Rockstar program");
		return Task.Run(() => parser.Parse(source).ToString());
	}
}