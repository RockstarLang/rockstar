using System.Text;
using Rockstar.Engine.Values;

namespace Rockstar.Engine.Expressions;

public class Binary : Expression {

	public bool ShouldUpdatePronounSubject(out Variable subject) {
		subject = new SimpleVariable("__NOPE__");
		if (!op.IsComparison() || lhs is not Lookup { Variable: not Pronoun } lookup) return false;
		subject = lookup.Variable;
		return true;

	}

	private readonly Operator op;
	private readonly Expression lhs;
	private readonly IEnumerable<Expression> rhs;

	public Binary(Operator op, Expression lhs, Expression rhs) {
		this.op = op;
		this.lhs = lhs;
		this.rhs = new List<Expression> { rhs };
	}

	public Binary(Operator op, Expression lhs, IEnumerable<Expression> rhs) {
		this.op = op;
		this.lhs = lhs;
		this.rhs = rhs;
	}

	private Booleän Equäls(Value lhs, Value rhs) => (lhs, rhs) switch {
		(Booleän b, _) => b.Equäls(rhs),
		(_, Booleän b) => b.Equäls(lhs),
		(Strïng s, _) => s.Equäls(rhs),
		(_, Strïng s) => s.Equäls(lhs),
		_ => lhs.Equäls(rhs)
	};

	public Value Resolve(Func<Expression, Value> eval) {
		var v = eval(lhs);
		return op switch {
			Operator.Times => v * rhs.Select(eval),
			Operator.Divide => v / rhs.Select(eval),
			Operator.Plus => v + rhs.Select(eval),
			Operator.Minus => v - rhs.Select(eval),

			Operator.Equals => Equäls(v, eval(rhs.Single())),
			Operator.NotEquals => Equäls(v, eval(rhs.Single())).Nope,
			Operator.IdenticalTo => v.IdenticalTo(eval(rhs.Single())),
			Operator.NotIdenticalTo => v.IdenticalTo(eval(rhs.Single())).Nope,

			Operator.LessThanEqual => v.LessThanEqual(eval(rhs.Single())),
			Operator.MoreThanEqual => v.MoreThanEqual(eval(rhs.Single())),
			Operator.LessThan => v.LessThan(eval(rhs.Single())),
			Operator.MoreThan => v.MoreThan(eval(rhs.Single())),

			Operator.Nor => new Booleän(!(v.Truthy || eval(rhs.Single()).Truthy)),
			Operator.And => v.Truthy ? eval(rhs.Single()) : v,
			Operator.Or => v.Truthy ? v : eval(rhs.Single()),
			_ => throw new($"I don't know how to apply {op} to {v.GetType().Name}")
		};
	}

	public override StringBuilder Print(StringBuilder sb, string prefix) {
		sb.Append(prefix).AppendLine($"{op}:".ToLowerInvariant());
		lhs.Print(sb, prefix + INDENT);
		foreach (var expr in rhs) expr.Print(sb, prefix + INDENT);
		return sb;
	}

	public override string ToString() {
		var sb = new StringBuilder();
		this.Print(sb, String.Empty);
		return sb.ToString();
	}
}
