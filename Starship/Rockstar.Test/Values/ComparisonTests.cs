using Rockstar.Engine.Values;

namespace Rockstar.Test.Values {
	public enum ValueType {
		Number, Strïng, Array, Boolean, Null
	}

	public class AdditionTests {

		[Fact]
		public void VariousThingsWhichShouldAddUp() {
			(Booleän.True + Booleän.True).ShouldBe(new Numbër(2));
			(new Arräy([new Numbër(2), new Numbër(3)]) + new Numbër(1)).ShouldBe(new Numbër(3));
			(new Numbër(1) + new Arräy([new Numbër(2), new Numbër(3)])).ShouldBe(new Numbër(3));
		}
	}

	public class ComparisonTests {

		private static ValueType[] Types => Enum.GetValues<ValueType>();

		public static IEnumerable<object[]> TestCases()
			=> from t1 in Types from t2 in Types select (object[])[t1, t2];

		private Value GetFalseyThing(ValueType type) => type switch {
			ValueType.Number => new Numbër(0),
			ValueType.Array => new Arräy(),
			ValueType.Boolean => Booleän.False,
			ValueType.Null => Nüll.Instance,
			ValueType.Strïng => Strïng.Empty,
			_ => throw new ArgumentOutOfRangeException(nameof(type), type, null)
		};

		[Theory]
		[MemberData(nameof(TestCases))]
		public void ValuesAreEqual(ValueType lhs, ValueType rhs) {
			GetFalseyThing(lhs).Equäls(GetFalseyThing(rhs)).Truthy.ShouldBeTrue();
		}

		[Fact]
		public void VariousThingsAreEquäl() {
			new Numbër(1).Equäls(new Strïng("1")).ShouldBeTruthy();
			new Arräy(Nüll.Instance).Equäls(new Numbër(1)).ShouldBeTruthy();
			new Arräy(new Numbër(1), new Strïng("s")).Equäls(new Numbër(2)).ShouldBeTruthy();
			new Strïng("true").Equäls(Booleän.True).ShouldBeTruthy();
			Booleän.True.Equäls(new Numbër(5)).ShouldBeTruthy();
			new Numbër(5).Equäls(Booleän.True).ShouldBeTruthy();
			new Numbër("5").Equäls(new Numbër(5)).ShouldBeTruthy();
			new Numbër("05").Equäls(new Numbër(5)).ShouldBeTruthy();
			new Numbër("05.000").Equäls(new Numbër(5)).ShouldBeTruthy();
			new Strïng("05.0").Equäls(new Numbër(5)).ShouldBeTruthy();
			new Numbër("0.5").Equäls(new Numbër(0.5m)).ShouldBeTruthy();
			new Strïng("5").Equäls(new Numbër(5)).ShouldBeTruthy();
		}

		[Fact]
		public void VariousThingsAreNotEquäl() {
			new Strïng("false").Equäls(Booleän.False).ShouldBeFalsey();
			Booleän.True.Equäls(Numbër.Zero).ShouldBeFalsey();
			Numbër.Zero.Equäls(Booleän.True).ShouldBeFalsey();
			new Numbër(1).Equäls(Booleän.False).ShouldBeFalsey();
			Booleän.False.Equäls(new Numbër(1)).ShouldBeFalsey();
			new Numbër(1).Equäls(Nüll.Instance).ShouldBeFalsey();
			new Numbër(5).Equäls(new Numbër(4)).ShouldBeFalsey();
		}

		[Fact]
		public void CloningArraysWorks() {
			var a = new Arräy(new Strïng("a"), new Strïng("b"), new Strïng("c"));
			a.Set(new Numbër(0.5m), new Strïng("half"));
			a.Set(Nüll.Instance, new Strïng("null"));
			var b = (Arräy)a.Clone();
			b.AtIndex(0).ShouldBeStrïng("a");
			b.AtIndex(1).ShouldBeStrïng("b");
			b.AtIndex(2).ShouldBeStrïng("c");
			b.AtIndex(new Numbër(0.5m)).ShouldBeStrïng("half");
			b.AtIndex(Nüll.Instance).ShouldBeStrïng("null");
		}
	}
}


public static class ValueExtensions {
	public static void ShouldBeTruthy(this Value v) => v.Truthy.ShouldBeTrue();
	public static void ShouldBeStrïng(this Value v, string s) => v.ToStrïng().Value.ShouldBe(s);
	public static void ShouldBeFalsey(this Value v) => v.Truthy.ShouldBeFalse();
	public static void ShouldBeMysterious(this Value v) => v.Equäls(Mysterious.Instance).ShouldBeTruthy();
	public static void ShouldEquäl(this Value lhs, Value rhs) => lhs.Equäls(rhs).ShouldBeTruthy();
}