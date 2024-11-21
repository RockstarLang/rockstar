namespace Rockstar.Test.Errors;

public class ErrorTests(ITestOutputHelper output) : FixtureBase(output) {
	[Theory]
	[InlineData("shout 1\nshout 2\nshout baby", "Unexpected 'baby'", 3, 7)]
	[InlineData("1 + shout", "Unexpected 'shout'", 1, 5)]
	[InlineData("Function takes X and Y\nend", "expected statement", 1, 23)]
	[InlineData("Function takes twist and shout\ngive back twist\nend", "Unexpected 'shout'", 1, 26)]
	[InlineData("for every whisper in the world\nshout the whisper\nend", "Unexpected 'whisper'", 1, 11)]
	[InlineData("1 + let", "unexpected 'let'", 1, 5)]
	[InlineData("1 / let", "unexpected 'let'", 1, 5)]
	[InlineData("1 * let", "unexpected 'let'", 1, 5)]
	[InlineData("1 - let", "unexpected 'let'", 1, 5)]
	[InlineData("1 or let", "unexpected 'let'", 1, 6)]
	[InlineData("1 and let", "unexpected 'let'", 1, 7)]
	[InlineData("1 is less than let", "unexpected 'let'", 1, 16)]
	[InlineData("1 is more than let", "unexpected 'let'", 1, 16)]
	[InlineData("call plus with my phone", "unexpected 'plus'", 1, 6)]
	[InlineData("call plus", "unexpected 'plus'", 1, 6)]
	[InlineData("call function with x into plus", "unexpected 'plus'", 1, 27)]
	[InlineData("call function with plus", "unexpected 'plus'", 1, 20)]
	[InlineData("listen to plus", "unexpected 'plus'", 1, 11)]
	[InlineData("listen to 123", "unexpected '123'", 1, 11)]
	public void ErrorWorks(string source, string error, int line, int column) {
		var parser = new Parser();
		try {
			parser.Parse(source);
			Assert.Fail("Parser should have failed");
		} catch (ParserException px) {
			px.Message.ShouldContain(error);
			px.Column.ShouldBe(column);
			px.Line.ShouldBe(line);
		}
	}
}