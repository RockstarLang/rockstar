using System.Text;
using System.Text.RegularExpressions;

namespace Rockstar.Engine.Expressions;

public abstract class Variable(string name) : Expression {

	public string Name => name;

	protected string NormalizedName { get; init; } = String.Join("_", whitespace.Split(name));

	public override string ToString()
		=> $"{GetType().Name.ToLower()}: {Key}"
			+ (Indexes.Any() ? "[" + String.Join("][", Indexes.Select(i => i.ToString())) + "]" : "");

	public override StringBuilder Print(StringBuilder sb, string prefix) {
		sb.Append(prefix).AppendLine($"variable: {name}");
		switch (Indexes.Count) {
			case 0: return sb;
			case 1:
				sb.Append(prefix).AppendLine("index:");
				break;
			default:
				sb.Append(prefix).AppendLine("indexes:");
				break;
		}
		foreach (var index in Indexes) index.Print(sb, prefix + INDENT);
		return sb;
	}

	private static readonly Regex whitespace = new("\\s+", RegexOptions.Compiled);

	public abstract string Key { get; }

	public IEnumerable<Variable> Concat(IEnumerable<Variable> tail)
		=> new List<Variable> { this }.Concat(tail);

	public List<Expression> Indexes { get; } = [];

	public bool ShouldUpdatePronounWhenAssigned
		=> this is not Pronoun;

	public Variable AtIndex(Expression index) {
		Indexes.Add(index);
		return this;
	}

	public Variable AtIndex(IEnumerable<Expression> indexes) {
		Indexes.AddRange(indexes);
		return this;
	}

	public string PrintIndexes() {
		if (Indexes.Any()) return ("[" + String.Join("][", Indexes.Select(i => i.ToString()).ToArray()) + "]");
		return String.Empty;
	}
}