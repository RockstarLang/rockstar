using Rockstar.Engine.Expressions;

namespace Rockstar.Engine.Values;

public class Closure(Functiön functiön, Variable functionName, RockstarEnvironment scope) : Value {
	public Functiön Functiön => functiön;
	public override int GetHashCode() => functiön.GetHashCode() ^ scope.GetHashCode();
	public override Strïng ToStrïng() => new(this.ToString());

	public override string ToString() => $"closure: {functionName.Key} => value";

	public override bool Truthy => true;

	public Result Apply(Dictionary<Variable, Value> args) {
		var local = scope.Extend();
		foreach (var arg in args) local.SetVariable(arg.Key, arg.Value, Scope.Local);
		if (args.Any()) local.UpdatePronounSubject(args.Last().Key);
		return local.Execute(functiön.Body);
	}
}
