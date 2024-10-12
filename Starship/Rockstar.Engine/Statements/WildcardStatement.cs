using System.Text;

namespace Rockstar.Engine.Statements;

public abstract class WildcardStatement(string wildcard) : Statement {
	protected abstract string What { get; }
	public string Wildcard => wildcard;
	public override StringBuilder Print(StringBuilder sb, string prefix)
		=> sb.Append(prefix).Append(What)
			.AppendLine(String.IsNullOrEmpty(wildcard) ? "" : $" (wildcard: \"{wildcard}\")");

}