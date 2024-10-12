using Rockstar.Engine.Values;

namespace Rockstar.Test.Values;

public class StrïngTests {

	[Theory]
	[InlineData("")]
	[InlineData("foo")]
	[InlineData(" ")]
	public void StringEqualityWorks(string s) {
		var s1 = new Strïng(s);
		var s2 = new Strïng(s);
		(s1 == s2).ShouldBe(true);
		s1.Equals(s2).ShouldBe(true);
	}

	[Theory]
	[InlineData("a", 1, "a")]
	[InlineData("a", 0, "")]
	[InlineData("a", -1, "a")]
	[InlineData("a", 2, "aa")]
	[InlineData("abc", 0, "")]
	[InlineData("abc", -1, "cba")]
	[InlineData("abc", -2, "cbacba")]
	[InlineData("abc", 0.1, "a")]
	[InlineData("abc", 0.5, "ab")]
	[InlineData("abcdefghij", 0.1, "a")]
	[InlineData("abcdefghij", 0.2, "ab")]
	[InlineData("abcdefghij", 0.3, "abc")]
	[InlineData("abcdefghij", 0.4, "abcd")]
	[InlineData("abcdefghij", 0.5, "abcde")]
	[InlineData("abcdefghij", 0.6, "abcdef")]
	[InlineData("abcdefghij", 0.7, "abcdefg")]
	[InlineData("abcdefghij", 0.8, "abcdefgh")]
	[InlineData("abcdefghij", 0.9, "abcdefghi")]
	[InlineData("abcdefghij", 1.1, "abcdefghija")]
	[InlineData("abcdefghij", -0.1, "j")]
	[InlineData("abcdefghij", -0.2, "ji")]
	[InlineData("abcdefghij", -0.3, "jih")]
	[InlineData("abcdefghij", -0.4, "jihg")]
	[InlineData("abcdefghij", -0.5, "jihgf")]
	[InlineData("abcdefghij", -0.6, "jihgfe")]
	[InlineData("abcdefghij", -0.7, "jihgfed")]
	[InlineData("abcdefghij", -0.8, "jihgfedc")]
	[InlineData("abcdefghij", -0.9, "jihgfedcb")]
	[InlineData("abcdefghij", -1.1, "jihgfedcbaj")]
	[InlineData("r", 0.999999999, "r")]
	[InlineData("hello world", 0.0000000001, "h")]
	public void StringMultiplicationByNumberWorks(string input, decimal factor, string expected)
		=> new Strïng(input).Times(factor).ShouldBeStrïng(expected);

	[Theory]
	[InlineData("", "abc", "")]
	[InlineData("abc", " ", "a b c ")]
	[InlineData("abc", "def", "adbdcd\naebece\nafbfcf")]
	public void StringMultiplicationByStringWorks(string input, string factor, string expected)
		=> new Strïng(input).Times(new Strïng(factor)).ShouldBeStrïng(expected.ReplaceLineEndings());


	[Theory]
	[InlineData("a", "a", "")]
	[InlineData("aa", "a", "a")]
	[InlineData("a", "b", "a")]
	[InlineData("hello world", "world", "hello ")]
	public void StringSubtractionWorks(string minuend, string subtrahend, string difference)
		=> new Strïng(minuend).Minus(new Strïng(subtrahend)).ShouldBeStrïng(difference);

	[Theory]
	[InlineData("a", "a", 1.0)]
	[InlineData("aaa", "a", 3.0)]
	[InlineData("abcde", "f", 0.0)]
	[InlineData("", "", 0.0)]
	[InlineData("banana", "na", 2.0)]
	[InlineData("one potato two potato three potato four", "potato", 3.0)]
	public void StringDivisionByStringWorks(string numerator, string denominator, decimal quotient)
		=> new Strïng(numerator).DividedBy(new Strïng(denominator)).ShouldBe(new Numbër(quotient));

	[Theory]
	[InlineData("a", 1.0, "a")]
	[InlineData("aaa", 2.0, "aa")]
	[InlineData("abcde", 0.5, "abcdeabcde")]
	[InlineData("abcdef", 2.0, "abc")]
	[InlineData("abcde", -1.0, "edcba")]
	public void StringDivisionByNumberWorks(string numerator, decimal denominator, string quotient)
		=> new Strïng(numerator).DividedBy(denominator).ShouldBeStrïng(quotient);

	[Fact]
	public void DequeueStringWorks() {
		var s = new Strïng("abc");
		s.Dequeue().ShouldBeStrïng("a");
		s.ShouldBeStrïng("bc");
		s.Dequeue().ShouldBeStrïng("b");
		s.ShouldBeStrïng("c");
		s.Dequeue().ShouldBeStrïng("c");
		s.ShouldBeStrïng("");
		s.Dequeue().ShouldBeMysterious();
	}


	[Fact]
	public void PopStringWorks() {
		var s = new Strïng("abc");
		s.Pop().ShouldBeStrïng("c");
		s.ShouldBeStrïng("ab");
		s.Pop().ShouldBeStrïng("b");
		s.ShouldBeStrïng("a");
		s.Pop().ShouldBeStrïng("a");
		s.ShouldBeStrïng("");
		s.Pop().ShouldBeMysterious();
	}
}