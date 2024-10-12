namespace Rockstar.Test;

public static class StringExtensions {
	/// <summary>Retrieves a substring, but won't throw an ArgumentOutOfRangeException</summary>
	/// <param name="s"></param>
	/// <param name="index"></param>
	/// <param name="length"></param>
	/// <returns></returns>
	public static string SafeSubstring(this string s, int index, int length) {
		if (index >= s.Length) index = s.Length;
		if (index + length >= s.Length) length = s.Length - index;
		return s.Substring(index, length);
	}
	public static string WithDebugInformationRemoved(this string s)
		=> String.Join(Environment.NewLine, s.ReplaceLineEndings().Split(Environment.NewLine)
			.Where(line => !line.StartsWith("DEBUG: ")));
}