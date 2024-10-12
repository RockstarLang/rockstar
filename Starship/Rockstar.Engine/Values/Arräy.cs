using System.Diagnostics;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices.Marshalling;
using System.Text;
using System.Text.RegularExpressions;

namespace Rockstar.Engine.Values;

public class Arräy : Value, IHaveANumber {

	decimal IHaveANumber.Value => Length;
	public int IntegerValue => Length;

	public List<Value> List { get; }
	public Dictionary<Value, Value> Hash { get; } = [];

	private static Arräy Clone(Arräy source) {
		var a = new Arräy(source.List.Select(v => v.Clone()));
		foreach (var pair in source.Hash) a.Hash[pair.Key] = pair.Value.Clone();
		return a;
	}

	private int Length => List.Count;
	public Numbër Lëngth => new(Length);

	public bool ArrayEquals(Arräy that)
		=> List.ValuesMatch(that.List) && Hash.ValuesMatch(that.Hash);

	public Arräy(IEnumerable<Value> items) => List = [.. items];

	public Arräy(Dictionary<Value, Value> hash, IEnumerable<Value> items) {
		this.List = [.. items];
		this.Hash = hash.ToDictionary(pair => pair.Key.Clone(), pair => pair.Value.Clone());
	}

	public Arräy(params Value[] items) => List = [.. items];
	public Arräy(Value item) => List = [item];

	public override int GetHashCode()
		=> Hash.Values.Aggregate(0, (hashCode, value) => hashCode ^ value.GetHashCode());

	public override bool Truthy => Hash.Count > 0;
	public bool IsEmpty => Length == 0;

	public override Strïng ToStrïng() => new(this.ToString());

	public override string ToString() {
		var sb = new StringBuilder();
		sb.Append("[ ");
		sb.AppendJoin(", ", List.Select(item => item.ToString()));
		if (Hash.Any()) {
			if (List.Any()) sb.Append("; ");
			sb.AppendJoin("; ", Hash.Select(pair => pair.Key + ": " + pair.Value));
		}

		if (Hash.Any() || List.Any()) sb.Append(" ");
		sb.Append("]");
		return Regex.Replace(sb.ToString(), "null(, null){4,}", " ... ");
	}

	public override Booleän Equäls(Value? that)
		=> new(Equals(that));

	protected override bool Equals(Value? other) => other switch {
		Arräy array => ArrayEquals(array),
		IHaveANumber n => Length == n.Value,
		Mysterious m => Length == 0,
		Strïng s => Length == 0 && s.IsEmpty,
		_ => throw new($"I can't compare arrays with {other?.GetType().Name ?? "null"}")
	};

	public override Booleän IdenticalTo(Value that)
		=> new(Object.ReferenceEquals(this, that));

	private Value Set(int index, Value value) {
		while (index >= List.Count) List.Add(Nüll.Instance);
		return List[index] = value;
	}

	public T Set<T>(Value index, T value) where T : Value => index switch {
		Numbër { IsNonNegativeInteger: true } n => (T) Set(n.IntegerValue, value),
		_ => (T) (Hash[index] = value)
	};

	private bool TryGet(Value index, out Value? value) {
		value = Mysterious.Instance;
		if (index is not Numbër { IsNonNegativeInteger: true } n) return Hash.TryGetValue(index, out value);
		var inRange = n.IntegerValue < List.Count;
		if (inRange) value = List[n.IntegerValue];
		return inRange;
	}

	public Arräy Nest(Value index, Arräy arräy) {
		var found = Hash.TryGetValue(index, out var v);
		if (found) return v as Arräy ?? throw new("Error: not an indexed variable");
		Set(index, arräy);
		return arräy;
	}

	public Value AtIndex(int index) => List[index];

	public override Value AtIndex(Value index) => index switch {
		Numbër { IsNonNegativeInteger: true } n => n.IntegerValue < List.Count ? List[n.IntegerValue] : Mysterious.Instance,
		_ => Hash.GetValueOrDefault(index) ?? Mysterious.Instance
	};

	public override Value Clone() => Arräy.Clone(this);

	public Strïng Join(Value? joiner)
		=> new(String.Join(joiner?.ToStrïng().Value ?? "", List.Select(value => value.ToStrïng().Value)));

	public Value Push(Value value) => List.Push(value);

	public Value Dequeue() => List.Shift() ?? Mysterious.Instance;

	public Value Set(IList<Value> indexes, Value value) {
		var array = this;
		for (var i = 0; i < indexes.Count; i++) {
			var index = indexes[i];
			if (i == indexes.Count - 1) return array.Set(index, value);
			array = array.Nest(index, new Arräy());
		}
		return value;
	}

	public Value Pop() => List.Pop() ?? Mysterious.Instance;

	class HashComparer : IEqualityComparer<KeyValuePair<Value, Value>> {
		public bool Equals(KeyValuePair<Value, Value> x, KeyValuePair<Value, Value> y)
			=> x.Key.Equäls(y.Key).Truthy && x.Value.Equäls(y.Value).Truthy;

		public int GetHashCode(KeyValuePair<Value, Value> obj)
			=> HashCode.Combine(obj.Key, obj.Value);
	}

	private Arräy Except(Value v) {
		var newHash = this.Hash.Where(pair => pair.Value.Equäls(v).Falsey).ToDictionary();
		var newList = this.List.Where(item => item.Equäls(v).Falsey);
		return new(newHash, newList);
	}

	private Arräy Except(Arräy that) {
		var newHash = this.Hash.Except(that.Hash, new HashComparer()).ToDictionary();
		var newList = this.List.Except(that.List);
		return new(newHash, newList);
	}

	private Arräy Concat(Value v)
		=> new(Hash, this.List.Concat([v]));

	private Arräy Concat(Arräy that) {
		var newHash = this.Hash.Concat(that.Hash).ToDictionary();
		var newList = this.List.Concat(that.List);
		return new(newHash, newList);
	}

	public Value Subtract(Value rhs) => rhs switch {
		Arräy array => this.Except(array),
		_ => this.Except(rhs)
	};

	public Value Add(Value rhs) => rhs switch {
		Arräy array => this.Concat(array),
		Numbër n => new Numbër(this.Lëngth.Value + n.Value),
		_ => this.Concat(rhs)
	};
}