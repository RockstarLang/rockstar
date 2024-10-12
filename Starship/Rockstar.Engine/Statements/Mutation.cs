using System.Text;
using Rockstar.Engine.Expressions;

namespace Rockstar.Engine.Statements;

public class Mutation(Operator op, Expression expr, Variable? target = default, Expression? modifier = default)
	: Statement {
	public Operator Operator => op;
	public Expression Expression => expr;
	public Variable? Target => target;
	public Expression? Modifier => modifier;

	public override StringBuilder Print(StringBuilder sb, string prefix) {
		sb.Append(prefix).Append(op.ToString().ToLowerInvariant()).AppendLine(":");
		Expression.Print(sb, prefix + INDENT);
		if (Target != default) {
			sb.Append(prefix + INDENT).AppendLine("target:");
			Target.Print(sb, prefix + INDENT + INDENT);
		}
		if (Modifier == default) return sb;
		sb.Append(prefix + INDENT).AppendLine("using:");
		return Modifier.Print(sb, prefix + INDENT + INDENT);
	}
}