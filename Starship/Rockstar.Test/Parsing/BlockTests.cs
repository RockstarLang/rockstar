namespace Rockstar.Test.Parsing;

public class BlockTests : ParserTestBase {
	[Theory]
	[InlineData("Say 1\n\nSay 2\n\nSay 3\n\n", 1, 1, 1)]
	[InlineData("Say 1\nSay 2\nSay 3", 3)]
	[InlineData("Say 1\n\n\n\nSay 2\nSay 3", 1, 2)]
	[InlineData("\n\n\n\nSay 1\n\n\n\nSay 2\nSay 3\n\n\n\n", 1, 2)]
	[InlineData("  (comment) Say 1; say 2; say 3   (comment)\n   (empty line)  \n say(comment)4", 3, 1)]
	public void ParserParsesBlocks(string source, params int[] counts) {
		var program = Parse(source);
		program.Blocks.Count.ShouldBe(counts.Length);
		program.Blocks.Select(b => b.Statements.Count).ShouldBe(counts);
	}
}

public class CommentTests : ParserTestBase {
	[Theory]
	[InlineData("(comment)\nsay 1(comment)")]
	[InlineData("""
	            The sky is like fire
	            My heart is nothing
	            the fire is like schizoidism
	            Until my heart is as high as the sky
	            Whisper it. It's with the fire, baby.
	            """)]
	public void ParserParsesBlocks(string source) {
		var program = Parse(source);
	}
}