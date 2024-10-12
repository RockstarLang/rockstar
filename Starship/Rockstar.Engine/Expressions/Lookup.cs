using System.Text;

namespace Rockstar.Engine.Expressions;

public class Lookup(Variable variable) : Expression {
	public Variable Variable => variable;
	public override StringBuilder Print(StringBuilder sb, string prefix)
		=> sb.Append(prefix).Append("lookup: ").Append(variable.Name).AppendLine(variable.PrintIndexes());

	public override string ToString() => $"lookup: {Variable}";
}