using System.Text.RegularExpressions;

namespace Rockstar.Engine.Expressions;

public class SimpleVariable : Variable {
	private static readonly Regex illegalCharacters = new("\\W+", RegexOptions.Compiled);
	public SimpleVariable(string name) :base(name) {
		if (illegalCharacters.IsMatch(name)) throw new ArgumentException($"{name} is not a valid simple variable name");
	}
	public override string Key => Name.ToLowerInvariant();
}