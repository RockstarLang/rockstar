using System.Text;
using Rockstar.Engine.Expressions;

namespace Rockstar.Engine.Statements;

public class Listen : Statement {
	public Variable? Variable { get; init; } = default;
	public Listen() {}
	public Listen(Variable variable) => this.Variable = variable;
	public override StringBuilder Print(StringBuilder sb, string prefix) {
		sb.Append(prefix).Append("listen:");
		if (Variable != default) sb.Append(" => ").Append(Variable.Name);
		return sb.AppendLine();
	}
}