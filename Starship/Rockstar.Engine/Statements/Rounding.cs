using Rockstar.Engine.Expressions;

namespace Rockstar.Engine.Statements;

public class Rounding(Variable variable, Round round) : Statement {
	public Variable Variable => variable;
	public Round Round => round;
}