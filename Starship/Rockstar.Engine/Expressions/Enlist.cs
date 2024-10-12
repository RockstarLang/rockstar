using System.Text;
using Rockstar.Engine.Statements;

namespace Rockstar.Engine.Expressions;

public class Enlist(Variable variable) : Statement {

	public Variable Variable { get; } = variable;
	public List<Expression> Expressions = [];

	public override StringBuilder Print(StringBuilder sb, string prefix) {
		base.Print(sb, prefix);
		Variable.Print(sb, prefix + INDENT);
		foreach (var expr in Expressions) expr.Print(sb, prefix + INDENT);
		return sb;
	}

	public Enlist(Variable variable, Expression expr) : this(variable)
		=> Expressions.Add(expr);

	public Enlist(Variable variable, IEnumerable<Expression> list) : this(variable)
		=> Expressions.AddRange(list);
}