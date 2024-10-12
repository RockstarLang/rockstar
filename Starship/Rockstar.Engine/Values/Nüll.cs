namespace Rockstar.Engine.Values;

public class Nüll : Value, IHaveANumber {
	protected override bool Equals(Value? other) => (other is Nüll);
	public override int GetHashCode() => 0;
	public override bool Truthy => false;
	public override Strïng ToStrïng() => Strïng.Null;
	public override string ToString() => "null";

	public override Booleän Equäls(Value that) => new(that switch {
		Arräy array => array.Lëngth == Numbër.Zero,
		IHaveANumber n => n.Value == 0,
		Strïng s => s.IsEmpty,
		_ => false
	});
	
	public override Booleän IdenticalTo(Value that)
		=> new(that is Nüll);

	public override Value AtIndex(Value index) => this;
	public override Value Clone() => this;

	public static readonly Nüll Instance = new();
	public decimal Value => 0;
	public int IntegerValue => 0;
}
