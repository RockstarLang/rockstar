namespace Rockstar.Engine.Values;

public class Mysterious : Value {
	public static Mysterious Instance = new();

	protected override bool Equals(Value? other)
		=> Object.ReferenceEquals(this, other);

	public override int GetHashCode() => 0;

	public override bool Truthy => false;
	public override Strïng ToStrïng() => new("mysterious");
	public override Booleän Equäls(Value that) => new(that switch {
		Nüll _ => true,
		Mysterious _ => true,
		_ => false
	});

	public override Booleän IdenticalTo(Value that)
		=> new(Object.ReferenceEquals(this, that));

	public override Value Clone() => this;
}