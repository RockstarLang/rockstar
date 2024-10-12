using System.Text;

namespace Rockstar.Engine.Expressions;

public abstract class Expression {
	public const string INDENT = "  ";

	public virtual StringBuilder Print(StringBuilder sb, string prefix)
		=> sb.Append(prefix).Append(this.GetType().Name.ToLowerInvariant()).AppendLine(":");

	public IEnumerable<Expression> Concat(IEnumerable<Expression> tail)
		=> new List<Expression> { this }.Concat(tail);
}
