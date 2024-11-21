using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;
using Pegasus.Common;

namespace Rockstar.Engine;

public static class PegasusParserExtensions {

	private static readonly char[] splitters = " ?!.,;".ToCharArray();

	public static string? ErrorToken(this Cursor cursor) {
		var lines = Regex.Split(cursor.Subject, "\r\n|\r|\n");
		if (lines.Length < cursor.Line) return null;
		var line = lines[cursor.Line - 1];
		if (line.Length < cursor.Column) return null;
		var token = line[(cursor.Column - 1)..].Split(splitters).FirstOrDefault("");
		return Regex.Escape(token);
	}

	public static string FormatError(this Cursor cursor, FormatException ex)
		=> (cursor.ErrorToken() == null ? "Error" : $"Unexpected '{cursor.ErrorToken()}'")
			+ $" at line {cursor.Line} col {cursor.Column}"
			+ ": " + ex.Message;
}