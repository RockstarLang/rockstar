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
	[InlineData("""A\nB""", new byte[] { 65, 92, 110, 66 })]
	[InlineData("""A\r\nB""", new byte[] { 65, 92, 114, 92, 110, 66 })]
	[InlineData("""A\tB""", new byte[] { 65, 92, 116, 66 })]
	[InlineData("""A\\B""", new byte[] { 65, 92, 92, 66 })]
	[InlineData(@"\", new byte[] { 92 })]
	public void BackspacesAreNotSpecial(string source, byte[] chars) {
		var result = Run($"write \"{source}\"");
		Encoding.UTF8.GetBytes(result).ShouldBe(chars);
	}
}
