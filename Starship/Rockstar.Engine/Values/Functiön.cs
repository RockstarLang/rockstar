using System.Text;
using Rockstar.Engine.Expressions;
using Rockstar.Engine.Statements;

namespace Rockstar.Engine.Values;

public class Functiön(IEnumerable<Variable> args, Block body)
	: Value {
	public Functiön(Block body) : this(new List<Variable>(), body) { }

	public IList<Variable> Args => args.ToList();
	public Block Body => body;
	protected override bool Equals(Value? other) => false;

	public override int GetHashCode() => args.GetHashCode() ^ body.GetHashCode();

	public override bool Truthy => true;
	public override Strïng ToStrïng()
		=> new($"function({String.Join(", ", args.Select(a => a.Key).ToArray())}");

	public override Booleän Equäls(Value that)
		=> IdenticalTo(that);

	public override Booleän IdenticalTo(Value that)
		=> new(Object.ReferenceEquals(this, that));

	public override Value AtIndex(Value index) => this;
	public override Value Clone() => this;

	public override StringBuilder Print(StringBuilder sb, string prefix) {
		sb.Append(prefix).Append($"function(");
		sb.Append(String.Join(", ", args.Select(a => a.Name)));
		sb.AppendLine("):");
		return body.Print(sb, prefix);
	}
}