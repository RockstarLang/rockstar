namespace Rockstar.Test.Parsing;

public abstract class ParserTestBase {
	private readonly Parser parser = new();

	protected Program Parse(string source)
		=> parser.Parse(source);

	
}
