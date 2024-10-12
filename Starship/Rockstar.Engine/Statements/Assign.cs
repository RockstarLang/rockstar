using System.Text;
using Rockstar.Engine.Expressions;

namespace Rockstar.Engine.Statements;

public class Assign(Variable variable, Expression expression) : ExpressionStatement(expression) {
	public Variable Variable => variable;
	public override StringBuilder Print(StringBuilder sb, string prefix) {
		sb.AppendLine(prefix + "assign:");
		variable.Print(sb, prefix + INDENT);
		return Expression.Print(sb, prefix + INDENT);
	}
}