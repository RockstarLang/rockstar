using Rockstar.Engine.Expressions;

namespace Rockstar.Engine.Statements;

public class WhileLoop(Expression condition, Block body)
	: Loop(condition, body, true) {
	protected override string LoopType => "while";
}