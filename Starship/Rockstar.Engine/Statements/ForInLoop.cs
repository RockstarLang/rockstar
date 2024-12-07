using System.Text;
using Rockstar.Engine.Expressions;

namespace Rockstar.Engine.Statements;

public abstract class ForLoop : Statement {
	private readonly Variable value;
	private readonly Variable index;
	public Variable Value => PrependArticle && value is SimpleVariable ? new CommonVariable($"the {value.Name}") : value;
	public Variable Index => PrependArticle && index is SimpleVariable ? new CommonVariable($"the {index.Name}") : index;
	public Expression Expression { get; }
	public Block Body { get; }
	private bool PrependArticle { get; }

	public override StringBuilder Print(StringBuilder sb, string prefix) {
		sb.Append(prefix).Append("for-loop").AppendLine(":");
		sb.Append(prefix).Append(INDENT).Append("value:").AppendLine(Value.Name);
		if (index != null) sb.Append(prefix).Append(INDENT).Append("index: ").AppendLine(Index.Name);
		sb.Append(prefix).Append(INDENT).AppendLine("array: ");
		Expression.Print(sb, prefix + INDENT+ INDENT);
		sb.Append(prefix).Append(INDENT).AppendLine("block: ");
		Body.Print(sb, prefix + INDENT + INDENT);
		return sb;
	}

	protected ForLoop(Variable value, Variable index, Expression expression, Block body, bool prependArticle) {
		this.value = value;
		this.index = index;
		Expression = expression;
		Body = body;
		PrependArticle = prependArticle;
	}
}

public class ForInLoop : ForLoop {
	public ForInLoop(Variable value, Variable index, Expression expression, Block body, bool prependArticle)
		: base(value, index, expression, body, prependArticle) { }
}
