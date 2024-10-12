namespace Rockstar.Test;

public class RunnerTests(ITestOutputHelper output) : FixtureBase(output) {

	[Theory]
	[MemberData(nameof(AllFixtureFiles))]
	[MemberData(nameof(AllExampleFiles))]
	[MemberData(nameof(AllV1FixtureFiles))]
	public void Run(RockFile file) => RunFile(file);
}
