using System.Text.RegularExpressions;

namespace Rockstar.Engine;

public interface IRockstarIO {
	public string? Read();
	public void Write(string s);
	public void WriteLine(string s);
	public void WriteLine() => WriteLine(String.Empty);

	public void WriteError(ParserException ex, string source) {
		this.WriteLine(ex.Message);
		this.WriteLine();
		var lines = Regex.Split("\n" + source, "\r\n|\r|\n");
		var digits = lines.Length.ToString().Length;
		for (var i = ex.Line - 2; i < ex.Line + 2; i++) {
			if (i < 0 || i >= lines.Length) continue;
			this.WriteLine($"{i.ToString().PadLeft(digits, ' ')}: {lines[i]}");
			if (i == ex.Line) this.WriteLine(String.Empty.PadRight(digits + 1 + ex.Column, ' ') + "^");
		}
	}
}
