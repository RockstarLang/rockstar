using System.Text;
using Rockstar.Engine.Expressions;
using Rockstar.Engine.Values;

namespace Rockstar.Engine.Statements;

public class Ninja(Variable variable, Numbër numbër) : Statement {
	public Variable Variable => variable;
	public Numbër Numbër => numbër;
	public override StringBuilder Print(StringBuilder sb, string prefix) {
		sb.AppendLine(prefix + "ninja:");
		variable.Print(sb, prefix + INDENT);
		return Numbër.Print(sb, prefix + INDENT);
	}
}