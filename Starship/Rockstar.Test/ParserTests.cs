namespace Rockstar.Test;

public class ParserTests(ITestOutputHelper output) : FixtureBase(output) {
	[Theory]
	[MemberData(nameof(AllFixtureFiles))]
	[MemberData(nameof(AllExampleFiles))]
	[MemberData(nameof(AllV1FixtureFiles))]
	public void Parse(RockFile file) => TestParser(file);
}

public class ArgumentTests {
	[Theory]
	[InlineData("arguments")]
	[InlineData("the world")]
	[InlineData("the outside")]
	public void Arguments_Appear_As_Arguments(string alias) {
		var io = new StringBuilderIO();
		var env = new RockstarEnvironment(io, ["one", "two", "three"]);
		var code = $"""
		              for arg in {alias}
		              shout arg
		              yeah
		              """;
		var parser = new Parser();
		var program = parser.Parse(code);
		env.Execute(program);
		io.Output.ShouldBe("one\ntwo\nthree\n".ReplaceLineEndings());
	}
}