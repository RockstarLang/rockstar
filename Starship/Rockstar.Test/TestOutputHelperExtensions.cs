namespace Rockstar.Test;

public static class TestOutputHelperExtensions {

	public static void WriteNCrunchFilePath(this ITestOutputHelper output, RockFile rockFile)
		=> output.WriteLine($"   at <Rockstar code> in {rockFile.UncrunchedFilePath}:line 1");

	public static void WriteLine(this ITestOutputHelper output, object? o)
		=> output.WriteLine(o?.ToString());

}
