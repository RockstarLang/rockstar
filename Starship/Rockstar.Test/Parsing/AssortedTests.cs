namespace Rockstar.Test.Parsing;

public class AssortedTests : ParserTestBase {
	[Fact]
	public void CallWithLotsOfSeparatorsIsParsable() {
		var source = "Call my function with 1, 2, & 3, 'n' 4'n'5'n'6 & 7";
		Parse(source);
	}
}
