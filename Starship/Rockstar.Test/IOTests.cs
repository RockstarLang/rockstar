namespace Rockstar.Test;

public class IOTests {
	private string Run(string rockstarCode) {
		var io = new StringBuilderIO();
		var te = new RockstarEnvironment(io);
		var parser = new Parser();
		var program = parser.Parse(rockstarCode);
		te.Execute(program);
		return io.Output;
	}

	[Theory]
	[InlineData("""A\nB""", new byte[] { 65, 10, 66 })]
	[InlineData("""A\r\nB""", new byte[] { 65, 13, 10, 66 })]
	[InlineData("""A\nB""", new byte[] { 65, 10, 66 })]
	[InlineData("""A\tB""", new byte[] { 65, 9, 66 })]
	[InlineData("""A\\B""", new byte[] { 65, 92, 66 })]
	public void EscapingOutputStringsWorks(string source, byte[] chars) {
		var result = Run($"write \"{source}\"");
		Encoding.UTF8.GetBytes(result).ShouldBe(chars);
	}
}
