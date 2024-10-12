using System.Text;
using Rockstar.Engine.Expressions;

namespace Rockstar.Engine.Statements;

public class Decrement(Variable v, int multiple) : Statement {
	public Variable Variable => v;
	public int Multiple => multiple;
	public override StringBuilder Print(StringBuilder sb, string prefix) {
		sb.Append(prefix).AppendLine($"decrement x {multiple}");
		return v.Print(sb, prefix + INDENT);
	}
}