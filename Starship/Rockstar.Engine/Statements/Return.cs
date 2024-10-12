using System.Text;
using Rockstar.Engine.Expressions;

namespace Rockstar.Engine.Statements;

public class Return(Expression expr) : ExpressionStatement(expr) {
	public override StringBuilder Print(StringBuilder sb, string prefix) {
		sb.Append(prefix).AppendLine("return:");
		return Expression.Print(sb, prefix + INDENT);
	}
}