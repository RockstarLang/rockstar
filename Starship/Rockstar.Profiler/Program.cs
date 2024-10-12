using System.Diagnostics;
using Rockstar.Engine;

const string DIRECTORY = "D:/Projects/github/RockstarLang/rockstar2/Starship/Rockstar.Test/programs";
var fullPath = Path.GetFullPath(DIRECTORY);
Console.WriteLine(fullPath);
var files = Directory.GetFiles(fullPath, "*.rock", SearchOption.AllDirectories);
var parser = new Parser();
var stopwatch = new Stopwatch();

const int FACTOR = 2;
foreach (var file in files) {
	stopwatch.Restart();
	var parseTime = 0;
	var runTime = 0;
	bool error;
	Exception? exception = null;
	try {
		var program = parser.Parse(File.ReadAllText(file));
		parseTime = (int) stopwatch.ElapsedMilliseconds;
		var io = new StringBuilderIO(() => "1");
		var e = new RockstarEnvironment(io);
		error = false;
		e.Execute(program);
		stopwatch.Restart();
		for (var i = 0; i < 10; i++) e.Execute(program);
		runTime = (int) stopwatch.ElapsedMilliseconds;
	} catch (Exception ex) {
		exception = ex;
		error = true;
	}
	stopwatch.Stop();
	var reportPath = file.Replace(fullPath, "").TrimStart(Path.DirectorySeparatorChar);
	Console.ForegroundColor = ConsoleColor.Blue;
	Console.Write(String.Empty.PadRight(parseTime / FACTOR, '#'));
	if (error) {
		Console.ForegroundColor = ConsoleColor.Red;
		var boom = exception == default ? "TIMEOUT" : exception.Message;
		Console.Write(boom);
		var pad = Math.Max(0, 60 - (parseTime / FACTOR) - boom.Length);
		Console.Write(String.Empty.PadRight(pad));
	} else {
		Console.ForegroundColor = ConsoleColor.Yellow;
		Console.Write(String.Empty.PadRight(runTime / FACTOR, '#'));
		var pad = Math.Max(0, 60 - (parseTime / FACTOR - runTime / FACTOR));
		Console.Write(String.Empty.PadRight(pad));
	}

	Console.ForegroundColor = ConsoleColor.Blue;
	Console.Write(parseTime.ToString().PadLeft(5));
	Console.Write("ms ");
	Console.ForegroundColor = ConsoleColor.Yellow;
	Console.Write(runTime.ToString().PadLeft(5));
	Console.Write("ms ");
	Console.WriteLine(reportPath);
}