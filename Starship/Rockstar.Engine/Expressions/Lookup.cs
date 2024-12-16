using System.Text;
using Rockstar.Engine.Statements;

namespace Rockstar.Engine.Expressions;

public class Lookup(Variable variable) : Expression {
	public Variable Variable => variable;

	public override StringBuilder Print(StringBuilder sb, string prefix) {
		sb.Append(prefix).AppendLine("lookup:");
		return Variable.Print(sb, prefix + INDENT);
	}

	public override string ToString() => $"lookup: {Variable}";
}