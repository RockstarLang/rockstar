namespace Rockstar.Engine.Expressions;

public static class OperatorExpressions {
	public static bool IsComparison(this Operator op) => op switch {
		Operator.Equals => true,
		Operator.NotEquals => true,
		Operator.IdenticalTo => true,
		Operator.NotIdenticalTo => true,
		Operator.LessThanEqual => true,
		Operator.MoreThanEqual => true,
		Operator.LessThan => true,
		Operator.MoreThan => true,
		_ => false
	};
}
