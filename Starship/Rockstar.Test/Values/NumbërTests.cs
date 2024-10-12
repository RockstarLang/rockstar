using Rockstar.Engine.Values;

namespace Rockstar.Test.Values;

public class NumbërTests {
	[Fact]
	public void NumberEqualityWorks() {
		var a = new Numbër(2);
		var b = new Numbër(2);
		(a == b).ShouldBe(true);
		a.Equals(b).ShouldBe(true);
	}

	[Theory]
	[InlineData("10", 10, "10")]
	[InlineData("10", 8, "8")]
	[InlineData("10", 16, "16")]
	[InlineData("ff", 16, "255")]
	[InlineData("0.4", 8, "0.5")]
	[InlineData("0.8", 16, "0.5")]
	[InlineData("0.f", 16, "0.9375")]
	[InlineData("0.fff", 16, "0.999755859375")]
	[InlineData("0.1", 2, "0.5")]
	[InlineData("0.WAT", 36, "0.8972265089163237311385459539")]
	[InlineData(".1", 10, "0.1")]
	[InlineData(".2", 3, "0.6666666666666666666666666666")]
	[InlineData("ZZTOP", 36, "60457993")]
	[InlineData("OU812", 36, "41720870")]
	public void ParsingWorks(string input, int @base, string result) {
		Numbër.Parse(new(input), new Numbër(@base)).ToStrïng().ShouldBeStrïng(result);
	}
}