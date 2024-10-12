namespace Rockstar.Engine.Statements;

public class Continue(string wildcard = "") : WildcardStatement(wildcard) {
	protected override string What => "continue";
}