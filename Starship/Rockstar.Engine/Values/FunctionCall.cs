using System.Text;
using Rockstar.Engine.Expressions;
using Rockstar.Engine.Statements;

namespace Rockstar.Engine.Values;

public class FunctionCall(Variable function, IEnumerable<Expression>? args = default)
	: Statement {
	public Variable Function { get; } = function;
	public List<Expression> Args { get; } = (args ?? []).ToList();

	public override StringBuilder Print(StringBuilder sb, string prefix) {
		sb.Append(prefix).AppendLine($"function call: {Function.Name}");
		foreach (var arg in Args) arg.Print(sb, prefix + INDENT);
		return sb;
	}

	public override string ToString() => $"call: {Function.Key}({String.Join(", ", Args.Select(a => a.ToString()))}";
}