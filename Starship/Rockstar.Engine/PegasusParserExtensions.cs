using System.Text.RegularExpressions;
using Pegasus.Common;

namespace Rockstar.Engine;

public static class PegasusParserExtensions {
	public static Source Source(this Cursor cursor, string lexeme = "")
		=> new(cursor.Line, cursor.Column, lexeme);

	public static string Error(this Cursor cursor, string unexpected)
		=> "Unexpected '" + Regex.Escape(unexpected) + "' at line " + cursor.Line + ", col " + (cursor.Column - 1);
}