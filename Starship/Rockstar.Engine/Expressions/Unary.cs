using System.Text;
using Rockstar.Engine.Values;

namespace Rockstar.Engine.Expressions;

public class Unary(Operator op, Expression expr)
	: Expression {
	public override StringBuilder Print(StringBuilder sb, string prefix) {
		sb.Append(prefix).Append("unary: ").AppendLine(op.ToString().ToLowerInvariant());
		return expr.Print(sb, prefix + INDENT);
	}

	public Value Resolve(Func<Expression, Value> eval) {
		var v = eval(expr);
		return op switch {
			Operator.Not => Booleän.Not(v),
			_ => throw new InvalidOperationException($"Can't apply {op} as a unary operator.")


			//Operator.Equals => v.Equäls(eval(rhs.Single())),
			//Operator.NotEquals => v.NotEquäls(eval(rhs.Single())),
			//Operator.LessThanEqual => v.LessThanEqual(eval(rhs.Single())),
			//Operator.MoreThanEqual => v.MoreThanEqual(eval(rhs.Single())),
			//Operator.LessThan => v.LessThan(eval(rhs.Single())),
			//Operator.MoreThan => v.MoreThan(eval(rhs.Single())),

			//Operator.Nor => new Booleän(v.Falsey && eval(rhs.Single()).Falsey),
			//Operator.And => v.Truthy ? eval(rhs.Single()) : v,
			//Operator.Or => v.Truthy ? v : eval(rhs.Single()),
		};
	}

}
