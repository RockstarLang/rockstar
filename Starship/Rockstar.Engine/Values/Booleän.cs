using System.Text;

namespace Rockstar.Engine.Values;

public class Booleän(bool value) : ValueOf<bool>(value), IHaveANumber {
	public override StringBuilder Print(StringBuilder sb, string prefix)
		=> sb.Append(prefix).Append("boolean: ").AppendLine(this.ToStrïng().Value);

	public static Booleän operator !(Booleän that) => new(that.Falsey);

	public override bool Truthy => Value;

	public override Strïng ToStrïng() => Value ? Strïng.True : Strïng.False;
	public override string ToString() => Value ? "true" : "false";

	public override Booleän Equäls(Value that)
		=> new(this.Truthy == that.Truthy);

	public override Booleän IdenticalTo(Value that)
		=> that is Booleän ? that.Equäls(this) : False;

	public override Value Clone() => this;

	public static Booleän False = new(false);
	public static Booleän True = new(true);
	decimal IHaveANumber.Value => Value ? 1 : 0;
	public int IntegerValue => Value ? 1 : 0;
	public Booleän Nope => new(!Truthy);
	public Value Negate => Not(this);

	public static Value Not(Value v) => new Booleän(!v.Truthy);

	public static explicit operator Booleän(bool b) => b ? True : False;
	public static explicit operator bool(Booleän b) => b.Truthy;
	public static bool operator true(Booleän b) => b.Truthy;
	public static bool operator false(Booleän b) => !b.Truthy;
}