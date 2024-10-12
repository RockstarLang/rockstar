namespace Rockstar.Engine;

public class Source(int line, int column, string lexeme = "") {

	public string Location => 
		$"(line {line}, column {column - lexeme.Length} [{lexeme}])";

	public static readonly Source None = new(0, 0, "");
}