using System.Text;

namespace Rockstar.Engine.Statements;

public class Block {
	public List<Statement> Statements { get; } = [];
	public Block() { }
	public Block Concat(Block tail) {
		this.Statements.AddRange(tail.Statements);
		return this;
	}
	public Block(params Statement[] statements) => this.Statements.AddRange(statements);

	public override string ToString() => Print(new()).ToString();

	public StringBuilder PrintTopLevel(StringBuilder sb) {
		foreach (var stmt in Statements) stmt.Print(sb, "");
		return sb;
	}

	public StringBuilder Print(StringBuilder sb, string prefix = "") {
		foreach (var stmt in Statements) stmt.Print(sb, prefix + "│ ");
		return sb.Append(prefix).AppendLine("└──────────");
	}
}