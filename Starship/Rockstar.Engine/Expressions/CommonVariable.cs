using System.Text.RegularExpressions;

namespace Rockstar.Engine.Expressions;

public class CommonVariable(string name) : Variable(name) {
	public override string Key => NormalizedName.ToLowerInvariant();
}

public class ProperVariable : Variable {
	private static readonly Regex validator = new("^(\\p{Lu}\\w*\\W+)+(\\p{Lu}\\w*)$");
	public ProperVariable(string name) : base(name) {
		if (!validator.IsMatch(name)) throw new ArgumentException($"'{name}' is not a valid proper variable name");
	}

	public override string Key => NormalizedName.ToUpperInvariant();
}