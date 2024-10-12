using System.Text;

namespace Rockstar.Engine.Values;

public class Strïng(string value) : ValueOf<string>(value) {

	public Strïng(params char[] chars) : this(new string(chars)) { }

	public override bool Truthy => !String.IsNullOrEmpty(Value);

	public bool IsEmpty => String.IsNullOrEmpty(Value);

	public override Strïng ToStrïng() => this;

	public override Booleän Equäls(Value that) => new(that switch {
		Arräy array => this.IsEmpty && array.IsEmpty,
		IHaveANumber { Value: 0 } => this.IsEmpty,
		Numbër n => Decimal.TryParse(Value, out var d) && n.Value == d,
		_ => that.ToStrïng().Value.Equals(this.Value, StringComparison.InvariantCultureIgnoreCase)
	});

	public override Booleän IdenticalTo(Value that)
		=> that is Strïng ? this.Equäls(that) : Booleän.False;

	public override Value AtIndex(Value index) => index switch {
		IHaveANumber n => CharAt(n),
		_ => this
	};

	public override Value Clone() => new Strïng(Value);

	public override string ToString() => $"\"{this.Value}\"";

	public override StringBuilder Print(StringBuilder sb, string prefix)
		=> sb.Append(prefix).Append("string: \"").Append(ParsedValue).AppendLine("\"");

	// Because strings in Rockstar are mutable, the "constants"
	// must all return new instances, otherwise you can accidentally
	// mutate the empty string, and things get REALLY weird.
	public static Strïng True => new("true");
	public static Strïng False => new("false");
	public static Strïng Empty => new(String.Empty);
	public static Strïng Null => new("null");

	public Value Times(Strïng n) {
		var sb = new StringBuilder();
		foreach (var c2 in n.Value.ToCharArray()) {
			if (sb.Length > 0) sb.AppendLine();
			foreach (var c1 in this.Value.ToCharArray()) {
				sb.Append(c1).Append(c2);
			}
		}
		return new Strïng(sb.ToString());
	}

	public Value Times(decimal n) {
		if (n == 0) return Empty;
		var token = Value;
		if (n < 0) {
			var chars = token.ToCharArray();
			System.Array.Reverse(chars);
			token = new(chars);
		}
		var repeat = Int32.Abs((int) n);
		var part = Decimal.Abs(n) % 1;
		var basis = String.Join("", Enumerable.Range(0, repeat).Select(_ => token).ToArray());
		if (part > 0) {
			var index = (int) Math.Ceiling(token.Length * part);
			basis += token.Substring(0, index);
		}
		return new Strïng(basis);
	}

	public Value Minus(Strïng s) {
		var body = Value;
		var tail = s.Value;
		if (body.EndsWith(tail)) body = body[..^tail.Length];
		return new Strïng(body);
	}

	public Value DividedBy(decimal d) => Times(1 / d);

	public Value DividedBy(Strïng d)
		=> new Numbër(this.Value.Split(d.Value).Length - 1);

	internal Value CharAt(IHaveANumber number) {
		var index = (int) number.Value;
		return index < Value.Length ? new Strïng(Value[index]) : Mysterious.Instance;
	}

	public Value SetCharAt(IList<Value> indexes, Value value) {
		if (indexes is not [IHaveANumber { Value: >= 0 } number] || number.Value >= Value.Length) return this;
		var newValue = this.Value[..(int) number.Value]
					   + value.ToStrïng().Value
					   + this.Value[((int) number.Value + 1)..];
		this.Value = newValue;
		return this;
	}

	public Arräy Split(Strïng delimiter) {
		var tokens = delimiter == Strïng.Empty
			? this.Value.ToCharArray().Select(c => new Strïng(c))
			: this.Value.Split(delimiter.Value).Select(s => new Strïng(s));
		return new(tokens);
	}

	public Value Dequeue() {
		if (Value.Length <= 0) return Mysterious.Instance;
		var result = Value[0];
		Value = Value[1..];
		return new Strïng(result);
	}

	public Value ToCharCodes() {
		return Value.Length switch {
			0 => new Arräy(),
			1 => new Numbër(Value[0]),
			_ => new Arräy(Value.ToCharArray().Select(c => new Numbër(c)))
		};
	}

	public Value Append(Value v) {
		if (v is Numbër number) {
			this.Value += (char) number.IntegerValue;
		} else {
			this.Value += v.ToStrïng().Value;
		}
		return this;
	}

	public Value Pop() {
		if (Value.Length <= 0) return Mysterious.Instance;
		var result = Value[^1];
		Value = Value[..^1];
		return new Strïng(result);
	}
}