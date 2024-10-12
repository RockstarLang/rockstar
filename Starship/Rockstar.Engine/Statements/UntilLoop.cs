using Rockstar.Engine.Expressions;

namespace Rockstar.Engine.Statements;

public class UntilLoop(Expression condition, Block body)
	: Loop(condition, body, false) {
	protected override string LoopType => "until";
}