using System.Text;

namespace Rockstar.Engine.Statements;

public class Dump : Statement {
	public override StringBuilder Print(StringBuilder sb, string prefix)
		=> sb.Append(prefix).Append("dump");
}
