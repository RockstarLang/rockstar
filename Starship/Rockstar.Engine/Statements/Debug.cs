using System.Text;
using Rockstar.Engine.Expressions;
using Rockstar.Engine.Values;

namespace Rockstar.Engine.Statements;

public class Debug(Expression expr) : ExpressionStatement(expr) {
	public override StringBuilder Print(StringBuilder sb, string prefix) {
		sb.Append(prefix).Append("debug: ");
		return Expression switch {
			Lookup lookup => sb.AppendLine(lookup.ToString()),
			Value value => sb.AppendLine(value.ToString()),
			_ => Expression.Print(sb.AppendLine(), prefix + INDENT)
		};
	}

}