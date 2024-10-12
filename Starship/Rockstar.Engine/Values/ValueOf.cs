namespace Rockstar.Engine.Values;

public abstract class ValueOf<T>(T value) : Value {
	public T ParsedValue { get; init; } = value;
	public T Value { get; protected set; } = value;
	public override bool Equals(object? obj) => Equals(obj as ValueOf<T>);
	public override int GetHashCode() => this.Value?.GetHashCode() ?? 0;
	public bool Equals(ValueOf<T>? that) => that != null && this.Value != null && this.Value.Equals(that.Value);
	protected override bool Equals(Value? that)
		=> that switch {
			ValueOf<T> t => Equals(t),
			_ => false
		};
}