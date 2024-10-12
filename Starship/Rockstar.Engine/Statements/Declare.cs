using System.Text;
using Rockstar.Engine.Expressions;

namespace Rockstar.Engine.Statements;

public class Declare(Variable variable, Expression? expression = null) : Statement {
	public Variable Variable => variable;
	public Expression? Expression => expression;

	public override StringBuilder Print(StringBuilder sb, string prefix) {
		sb.AppendLine(prefix + "declare:");
		variable.Print(sb, prefix + INDENT);
		return (expression == default ? sb : expression.Print(sb, prefix + INDENT));
	}
}