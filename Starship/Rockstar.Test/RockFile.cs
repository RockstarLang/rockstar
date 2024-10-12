namespace Rockstar.Test;

public class RockFile(string absolutePath) : IXunitSerializable {

	public RockFile() : this(String.Empty) { }

	public override string ToString() {
		var segments = new Stack<string>(AbsolutePath.Split(Path.DirectorySeparatorChar));
		var result = new List<string>();
		string segment;
		while ((segment = segments.Pop()) != "programs") result.Insert(0, segment);
		return String.Join(Path.DirectorySeparatorChar, result.ToArray());
	}

	public string NameThing => ToString().Replace(Path.DirectorySeparatorChar, '_');

	private string AbsolutePath { get; set; } = absolutePath;

	public string Contents => File.ReadAllText(AbsolutePath, Encoding.UTF8);

	public string ActualOutputPath => Uncrunch(AbsolutePath) + "-actual";
	public string ExpectOutputPath => Uncrunch(AbsolutePath) + "-expect";

	public static string Uncrunch(string filePath) {
		var originalProjectPath = NCrunchEnvironment.GetOriginalProjectPath();
		var testProjectDirectory = Path.GetDirectoryName(originalProjectPath)!;
		var segments = new Stack<string>(filePath.Split(Path.DirectorySeparatorChar));
		var pathToTest = String.Empty;
		while (segments.Any()) {
			pathToTest = Path.Combine(segments.Pop(), pathToTest);
			var candidate = Path.Combine(testProjectDirectory, pathToTest);
			if (File.Exists(candidate)) return candidate;
		}
		throw new($"Couldn't determine original project path for {filePath}");
	}

	public string UncrunchedFilePath =>
#if NCRUNCH
		Uncrunch(this.AbsolutePath);
#else
		AbsolutePath;
#endif

	private string? expectedOutput = null;

	public string ExpectedOutput => expectedOutput ??= ExtractExpectedOutput();


	private string ExtractExpectedOutput() {
		if (File.Exists(AbsolutePath + ".out")) return File.ReadAllText(AbsolutePath + ".out", Encoding.UTF8).ReplaceLineEndings();
		var source = (File.Exists(AbsolutePath) ? File.ReadAllText(AbsolutePath, Encoding.UTF8) : AbsolutePath).ReplaceLineEndings();
		var limit = source.Length;
		var output = new List<string>();
		var depth = 0;
		for (var i = 0; i < limit; i++) {
			var token = source.SafeSubstring(i, 9);
			switch (token) {
				case "(expect:\r":
				case "(prints:\r":
				case "(writes:\r":
				case "(expect:\n":
				case "(prints:\n":
				case "(writes:\n":
				case "(expect: ":
				case "(prints: ":
				case "(writes: ":
					i += 9;
					if (source[i] == '\n') i++;
					depth = 1;
					var j = i;
					while (j < limit) {
						if (source[j] == '(') depth += 1;
						if (source[j] == ')') depth -= 1;
						if (depth == 0) break;
						j++;
					}
					var expected = Regex.Unescape(source.Substring(i, j - i));
					if (token != "(writes: " && !expected.EndsWith(Environment.NewLine)) {
						expected += Environment.NewLine;
					}

					output.Add(expected);
					i = j;
					break;
			}
		}
		return String.Join("", output).ReplaceLineEndings();
	}

	public bool ExtractedExpectedError(string label, out string? error) {
		error = null;
		var source = File.Exists(AbsolutePath) ? File.ReadAllText(AbsolutePath, Encoding.UTF8) : AbsolutePath;
		var limit = source.Length;
		var token = $"({label}: ";
		for (var i = 0; i < limit; i++) {
			if (source.SafeSubstring(i, token.Length) != token) continue;
			i += token.Length;
			var j = i;
			while (j < limit && source[j] != ')') j++;
			error = Regex.Unescape(source.Substring(i, j - i));
			return true;
		}
		return false;
	}

	public bool HasExpectedErrors(string label) => ExtractedExpectedError(label, out _);

	public Queue<string>? SimulateInputs() {
		foreach (var path in new[] {
			AbsolutePath + ".in",
			AbsolutePath.Replace("-part-1.rock", ".rock") + ".in",
			AbsolutePath.Replace("-part-2.rock", ".rock") + ".in"
		}) {
			if (File.Exists(path)) return new(File.ReadAllLines(path));
		}
		return null;
	}

	public void Deserialize(IXunitSerializationInfo info) {
		this.AbsolutePath = info.GetValue<string>("path");
		this.expectedOutput = null;
	}

	public void Serialize(IXunitSerializationInfo info) => info.AddValue("path", AbsolutePath);
}
