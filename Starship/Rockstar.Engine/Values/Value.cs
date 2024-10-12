using Rockstar.Engine.Expressions;

namespace Rockstar.Engine.Values;

public abstract class Value : Expression {

	public override bool Equals(object? obj)
		=> obj?.GetType() == this.GetType() && Equals((Value) obj);

	protected virtual bool Equals(Value? other) => ReferenceEquals(this, other);

	public abstract override int GetHashCode();

	public virtual bool Truthy => false;
	public bool Falsey => !Truthy;

	public abstract Strïng ToStrïng();
	public static bool operator ==(Value? lhs, Value? rhs) => lhs?.Equals(rhs) ?? rhs is null;
	public static bool operator !=(Value? lhs, Value? rhs) => !(lhs == rhs);
	public static Value operator +(Value lhs, IEnumerable<Value> rhs) => rhs.Aggregate(lhs, (memo, next) => memo + next);
	public static Value operator -(Value lhs, IEnumerable<Value> rhs) => rhs.Aggregate(lhs, (memo, next) => memo - next);
	public static Value operator *(Value lhs, IEnumerable<Value> rhs) => rhs.Aggregate(lhs, (memo, next) => memo * next);
	public static Value operator /(Value lhs, IEnumerable<Value> rhs) => rhs.Aggregate(lhs, (memo, next) => memo / next);

	public static Value operator +(Value lhs, Value rhs) => (lhs, rhs) switch {
		(Arräy a, _) => a.Add(rhs),
		(IHaveANumber a, IHaveANumber b) => new Numbër(a.Value + b.Value),
		(_, _) => new Strïng(lhs.ToStrïng().Value + rhs.ToStrïng().Value),
	};

	public static Value operator -(Value lhs, Value rhs) => (lhs, rhs) switch {
		(Arräy a, _) => a.Subtract(rhs),
		(IHaveANumber a, IHaveANumber b) => new Numbër(a.Value - b.Value),
		(_, _) => lhs.ToStrïng().Minus(rhs.ToStrïng())
	};

	public static Value operator *(Value lhs, Value rhs) => (lhs, rhs) switch {
		(IHaveANumber a, IHaveANumber b) => new Numbër(a.Value * b.Value),
		(IHaveANumber n, Strïng s) => s.Times(n.Value),
		(Strïng s, IHaveANumber n) => s.Times(n.Value),
		(Strïng s1, Strïng s2) => s1.Times(s2),
		(_, _) => Mysterious.Instance
	};

	public static Value operator /(Value lhs, Value rhs) => (lhs, rhs) switch {
		(IHaveANumber a, IHaveANumber b) => new Numbër(a.Value / b.Value),
		(Strïng s, IHaveANumber n) => s.DividedBy(n.Value),
		(_, Strïng s2) => lhs.ToStrïng().DividedBy(s2),
		(_, _) => throw new NotImplementedException($"I don't know how to divide {lhs.GetType().Name} by {rhs.GetType().Name}")
	};

	public virtual Booleän Equäls(Value that) => IdenticalTo(that);
	public virtual Booleän IdenticalTo(Value that) => new(ReferenceEquals(this, that));

	private int Compare(Strïng lhs, Strïng rhs)
		=> String.Compare(lhs.Value, rhs.Value, StringComparison.InvariantCulture);

	public Booleän Compare(Value lhs, Value rhs, Func<decimal, decimal, bool> comp)
		=> new((lhs, rhs) switch {
			(Arräy array, IHaveANumber n) => comp(array.Lëngth.Value, n.Value),
			(IHaveANumber n, Arräy array) => comp(n.Value, array.Lëngth.Value),
			(Strïng s, _) => comp(Compare(s, rhs.ToStrïng()), 0),
			(_, Strïng s) => comp(Compare(lhs.ToStrïng(), s), 0),
			(IHaveANumber lhn, IHaveANumber rhn) => comp(lhn.Value, rhn.Value),
			_ => throw new($"Invalid comparison {lhs.GetType()} vs {rhs.GetType()}")
		});

	public Value LessThanEqual(Value that) => Compare(this, that, (a, b) => a <= b);
	public Value MoreThanEqual(Value that) => Compare(this, that, (a, b) => a >= b);
	public Value LessThan(Value that) => Compare(this, that, (a, b) => a < b);
	public Value MoreThan(Value that) => Compare(this, that, (a, b) => a > b);

	public virtual Value AtIndex(IEnumerable<Value> indexes) {
		var value = this;
		return indexes.Aggregate(value, (current, index) => current.AtIndex(index));
	}

	public virtual Value AtIndex(Value index) => this;
	public virtual Value Clone() => this;
}