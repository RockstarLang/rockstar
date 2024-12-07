using System.Diagnostics;
using Rockstar.Engine;
namespace Rockstar;

public static class Program {
	private static bool showTiming = false;
	private static readonly Parser parser = new();
	public static void Main(string[] args) {
		string? rockstarProgramFile = null;
		List<string> programArguments = [];
		foreach (var arg in args) {
			if (rockstarProgramFile == null) {
				switch (arg) {
					case "--version" or "-v":
						DisplayVersionAndExit();
						break;
					case "--timing" or "-t":
						showTiming = true;
						break;
				}
				if (arg.EndsWith(".rock", StringComparison.InvariantCultureIgnoreCase)) rockstarProgramFile = arg;
			} else {
				programArguments.Add(arg);
			}
		}

		if (rockstarProgramFile != null) {
			RunFile(rockstarProgramFile, programArguments.ToArray());
		} else {
			Console.WriteLine($"Rockstar {RockstarEnvironment.VERSION} on {System.Runtime.InteropServices.RuntimeInformation.RuntimeIdentifier}.");
			Console.WriteLine("Type 'exit' to exit.");
			RunPrompt();
		}
	}

	private static void DisplayVersionAndExit() {
		Console.WriteLine(RockstarEnvironment.VERSION);
		Environment.Exit(0);
	}

	private static void RunFile(string path, string[] args) {
		Stopwatch? sw = null;
		IRockstarIO io = new ConsoleIO();
		var env = new RockstarEnvironment(io, args);
		var source = File.ReadAllText(path).ReplaceLineEndings();
		if (showTiming) {
			sw = new();
			sw.Start();
		}
		try {
			Run(source, env);
		} catch (ParserException ex) {
			io.WriteError(ex, source);
		}
		if (sw == null) return;
		sw.Stop();
		Console.WriteLine();
		Console.Write("Program completed in ");
		Console.WriteLine(sw.ElapsedMilliseconds switch {
			> 9999 => sw.Elapsed.TotalSeconds + " seconds",
			_ => sw.ElapsedMilliseconds + " ms"
		});
	}

	private static void RunPrompt() {
		var env = new RockstarEnvironment(new ConsoleIO());
		while (true) {
			env.Write("» ");
			var line = env.ReadInput();
			if (line == null) break;
			var result = Run(line, env);
			Console.WriteLine("« " + result.Value);
		}
	}

	private static Result Run(string source, RockstarEnvironment env) {
		try {
			var program = parser.Parse(source);
			var result = env.Execute(program);
			if (result.WhatToDo == WhatToDo.Exit) Environment.Exit(0);
			return result;
		} catch (FormatException ex) {
			Console.Error.WriteLine(ex);
		}

		return Result.Unknown;
	}
}