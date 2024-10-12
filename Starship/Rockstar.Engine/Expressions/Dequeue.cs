using System.Text;

namespace Rockstar.Engine.Expressions;

public abstract class VariableExpression(Variable variable) : Expression {
	public Variable Variable => variable;
	public override StringBuilder Print(StringBuilder sb, string prefix) {
		base.Print(sb, prefix);
		return variable.Print(sb, prefix + INDENT);
	}
}

public class Dequeue(Variable variable) : VariableExpression(variable);

public class Pop(Variable variable) : VariableExpression(variable);