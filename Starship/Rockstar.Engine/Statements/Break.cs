namespace Rockstar.Engine.Statements;

public class Break(string wildcard = "") : WildcardStatement(wildcard) {
	protected override string What => "break";
}