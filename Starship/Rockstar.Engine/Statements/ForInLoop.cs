using Rockstar.Engine.Expressions;

namespace Rockstar.Engine.Statements;

public abstract class ForLoop : Statement {
	private readonly Variable value;
	private readonly Variable index;
	public Variable Value => PrependArticle && value is SimpleVariable ? new CommonVariable($"the {value.Name}") : value;
	public Variable Index => PrependArticle && index is SimpleVariable ? new CommonVariable($"the {index.Name}") : index;
	public Expression Expression { get; }
	public Block Body { get; }
	public bool PrependArticle { get; }

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