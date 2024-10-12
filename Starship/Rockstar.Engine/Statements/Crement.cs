using System.Text;
using Rockstar.Engine.Expressions;

namespace Rockstar.Engine.Statements;

public class Crement(Variable v, int delta) : Statement {
	public Variable Variable => v;
	private string Direction => (delta > 0 ? "increment" : "decrement");
	public int Delta => delta;
	public override StringBuilder Print(StringBuilder sb, string prefix) {
		sb.Append(prefix).AppendLine($"{Direction} x {delta}");
		return v.Print(sb, prefix + INDENT);
	}
}