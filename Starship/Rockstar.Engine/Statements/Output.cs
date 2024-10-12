using System.Text;
using Rockstar.Engine.Expressions;

namespace Rockstar.Engine.Statements;

public class Output(Expression expr, string suffix = "") : ExpressionStatement(expr) {
	public string Suffix { get; } = suffix;

	public override StringBuilder Print(StringBuilder sb, string prefix) {
		sb.Append(prefix).AppendLine("output: ");
		return Expression.Print(sb, prefix + INDENT);
	}
}