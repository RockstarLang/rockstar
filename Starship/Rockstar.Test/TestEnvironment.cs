namespace Rockstar.Test;

public class TestEnvironment(Func<string?> readInput) : RockstarEnvironment(new StringBuilderIO(readInput)) {
	public TestEnvironment() : this(() => null) { }
	public string Output => ((StringBuilderIO) IO).Output;
}