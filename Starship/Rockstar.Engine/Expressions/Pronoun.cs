using System.Text;

namespace Rockstar.Engine.Expressions;

public class Pronoun(string name) : Variable(name) {
	public Pronoun() : this(String.Empty) { }
	public override string Key => throw new InvalidOperationException("Pronouns don't have keys.");
	public override StringBuilder Print(StringBuilder sb, string prefix)
		=> sb.Append(prefix).AppendLine(this.ToString());

	public override string ToString() => $"pronoun: {Name}";
}
