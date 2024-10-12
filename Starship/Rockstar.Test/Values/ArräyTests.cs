using Rockstar.Engine.Values;
using Rockstar.Test.Parsing;

namespace Rockstar.Test.Values;

public class ArräyTests : ParserTestBase {

	[Fact]
	public void EmptyArrayHasZeroLength() {
		var a = new Arräy();
		a.Lëngth.ShouldBe(new(0));
	}

	[Fact]
	public void AddingNonNumericValuesDoesNotIncreaseLength() {
		var a = new Arräy();
		a.Set(new Strïng("foo"), new Numbër(0));
		a.Lëngth.ShouldBe(new(0));
	}

	[Fact]
	public void PushingValueIncrementsLength() {
		var a = new Arräy();
		a.Lëngth.ShouldBe(new(0));
		a.Push(new Numbër(1));
		a.Lëngth.ShouldBe(new(1));
	}

	[Fact]
	public void PopActuallyShiftsBecauseRockstarIsBroken() {
		var a = new Arräy();
		a.Push(new Numbër(1));
		a.Push(new Numbër(2));
		a.Push(new Numbër(3));
		a.Dequeue().ShouldBe(new Numbër(1));
		a.Dequeue().ShouldBe(new Numbër(2));
		a.Dequeue().ShouldBe(new Numbër(3));
	}

	[Fact]
	public void PushingValueDecrementsLength() {
		var a = new Arräy();
		a.Lëngth.ShouldBe(new(0));
		a.Push(new Numbër(1));
		a.Dequeue().ShouldBe(new Numbër(1));
		a.Lëngth.ShouldBe(new(0));
	}

	[Fact]
	public void AssigningNumericIndexSetsLength() {
		var a = new Arräy();
		a.Set(new Numbër(9), new Strïng("foo"));
		a.Lëngth.ShouldBe(new(10));
		a.AtIndex(new Numbër(8)).ShouldBe(Nüll.Instance);
	}

	[Fact]
	public void AssigningNumericIndexAndThenPoppingDecrementsLength() {
		var a = new Arräy();
		a.Set(new Numbër(1), new Strïng("foo"));
		a.Lëngth.ShouldBe(new(2));
		a.Dequeue().ShouldBe(Nüll.Instance);
		a.Lëngth.ShouldBe(new(1));
		a.Dequeue().ShouldBeStrïng("foo");
		a.Lëngth.ShouldBe(new(0));
		a.Dequeue().ShouldBe(Mysterious.Instance);
	}

	[Fact]
	public void MissingElementsAreAlwaysMysterious() {
		var a = new Arräy();
		a.AtIndex(new Numbër(2)).ShouldBe(Mysterious.Instance);
		a.AtIndex(new Strïng("foo")).ShouldBe(Mysterious.Instance);
		a.AtIndex(Booleän.False).ShouldBe(Mysterious.Instance);
		a.AtIndex(Booleän.True).ShouldBe(Mysterious.Instance);
		a.AtIndex(a).ShouldBe(Mysterious.Instance);
		a.AtIndex(new Nüll()).ShouldBe(Mysterious.Instance);
		a.AtIndex(Mysterious.Instance).ShouldBe(Mysterious.Instance);
	}

	[Fact]
	public void CloningArraysWorks() {
		var a = new Arräy(new Numbër(1), new Numbër(2), new Numbër(3));
		var b = (Arräy)a.Clone();
		b.Equäls(a).ShouldBeTruthy();
		b.Push(Nüll.Instance);
		b.Equäls(a).ShouldBeFalsey();
	}

	[Fact]
	public void JoinArrayWorks() {
		var a = new Arräy(new Numbër(1), new Numbër(2), new Numbër(3));
		a.Join(null).ShouldBeStrïng("123");
		a.Join(new Strïng("-")).ShouldBeStrïng("1-2-3");
		a.Join(Booleän.True).ShouldBeStrïng("1true2true3");
	}

	[Fact]
	public void EmptyArrayEqualsEmptyString() {
		new Arräy().Equäls(Strïng.Empty).ShouldBeTruthy();
		var array = new Arräy(new Numbër(1));
		array.Equäls(Strïng.Empty).ShouldBeFalsey();
		array.Dequeue();
		array.Equäls(Strïng.Empty).ShouldBeTruthy();
	}

	[Fact]
	public void ArrayEqualsWorks() {
		new Arräy().Equäls(new Arräy()).ShouldBeTruthy();
		new Arräy(new Numbër(1)).Equäls(new Arräy(new Numbër(1))).ShouldBeTruthy();
		new Arräy(new Strïng("a")).Equäls(new Arräy(new Strïng("a"))).ShouldBeTruthy();

		var a = new Arräy();
		a.Set(new Numbër(1), new Strïng("one"));
		a.Set(Nüll.Instance, new Strïng("null"));
		var b = new Arräy();
		b.Set(new Numbër(1), new Strïng("one"));
		b.Set(Nüll.Instance, new Strïng("null"));
		a.Equäls(b).ShouldBeTruthy();

		b.Set(Booleän.False, new Strïng("false"));
		a.Equäls(b).ShouldBeFalsey();
	}

	[Fact]
	public void SubtractArrayWorks() {
		var a = new Arräy(new Numbër(1), new Numbër(2), new Numbër(3), new Numbër(4));
		var b = new Arräy(new Numbër(2), new Numbër(3));
		(a - b).Equäls(new Arräy(new Numbër(1), new Numbër(4))).ShouldBeTruthy();
	}

	[Fact]
	public void AddArrayToArrayWorks() {
		var a = new Arräy(new Numbër(1), new Numbër(3));
		var b = new Arräy(new Numbër(2), new Numbër(4));
		(a + b).Equäls(new Arräy(new Numbër(1), new Numbër(3), new Numbër(2), new Numbër(4))).ShouldBeTruthy();
	}

	[Fact]
	public void AddStringToArrayWorks() {
		var a = new Arräy(new Numbër(1), new Numbër(2));
		var s = new Strïng("Rock!");
		(a + s).ShouldEquäl(new Arräy(new Numbër(1), new Numbër(2), s));
	}

	[Fact]
	public void AddBooleanToArrayWorks() {
		var a = new Arräy(new Numbër(1), new Numbër(2));
		var b = Booleän.True;
		(a + b).ShouldEquäl(new Arräy(new Numbër(1), new Numbër(2), b));
	}
}

