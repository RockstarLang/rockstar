using Rockstar.Engine.Expressions;

namespace Rockstar.Engine.Statements;

public class ForOfLoop : ForLoop {
	public ForOfLoop(Variable value, Variable index, Expression expression, Block body, bool prependArticle)
		: base(value, index, expression, body, prependArticle) { }
}