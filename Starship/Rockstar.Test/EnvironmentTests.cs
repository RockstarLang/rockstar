using Rockstar.Engine.Expressions;
using Rockstar.Engine.Values;

namespace Rockstar.Test {
	public class EnvironmentTests {

		[Fact]
		public void GlobalScopeWorks() {
			var io = new StringBuilderIO();
			var e1 = new RockstarEnvironment(io);
			var foo = new SimpleVariable("foo");
			var bar = new SimpleVariable("bar");
			var value = new Numbër(123);
			var e2 = e1.Extend();
			var e3 = e2.Extend();
			var e4 = e3.Extend();
			e1.SetVariable(foo, value, Scope.Local);
			e2.SetVariable(bar, value, Scope.Local);
			e4.GetStore(foo, Scope.Global).ShouldBe(e1);
			e4.GetStore(bar, Scope.Global).ShouldBe(e2);

			var n = new Numbër(456);
			e4.SetVariable(foo, n, Scope.Local);
			e4.Lookup(foo).ShouldBe(n);
			e3.Lookup(foo).ShouldBe(value);
			e2.Lookup(foo).ShouldBe(value);
			e1.Lookup(foo).ShouldBe(value);

			e4.SetVariable(foo, n, Scope.Local);
			e4.Lookup(foo).ShouldBe(n);
			e3.Lookup(foo).ShouldBe(value);
			e2.Lookup(foo).ShouldBe(value);
			e1.Lookup(foo).ShouldBe(value);

			var s1 = new Strïng("foo");
			var s2 = new Strïng("bar");
			e4.SetVariable(bar, s1);
			e1.SetVariable(bar, s2);
			e4.Lookup(bar).ShouldBe(s1);
			e3.Lookup(bar).ShouldBe(s1);
			e2.Lookup(bar).ShouldBe(s1);
			e1.Lookup(bar).ShouldBe(s2);
		}

		[Theory]
		[InlineData("MY VARIABLE", "my   variable")]
		[InlineData("thE SKY", "the\tsky")]
		[InlineData("your dreams", "Your Dreams")]
		[InlineData("a GIRL", "a   girl")]
		[InlineData("Our price", "OUR    PRICE")]
		public void CommonVariableNamesAreNormalized(string name1, string name2) {
			var io = new StringBuilderIO();
			var e = new RockstarEnvironment(io);
			var v1 = new CommonVariable(name1);
			var v2 = new CommonVariable(name2);
			v1.Key.ShouldBe(v2.Key);
			e.Assign(v1, new Numbër(123));
			e.Lookup(v2).ShouldBe(new Numbër(123));
		}

		[Theory]
		[InlineData("Doctor Feelgood", "DOCTOR FEELGOOD")]
		[InlineData("Billie Jean", "BILLIE    JEAN")]
		[InlineData("Billy Ray Cyrus", "BILLY  RAY     \tCyrus")]
		[InlineData("Income Tax", "INCome   TaX")]
		public void ProperVariableNamesAreNormalized(string name1, string name2) {
			var io = new StringBuilderIO();
			var e = new RockstarEnvironment(io);
			var v1 = new ProperVariable(name1);
			var v2 = new ProperVariable(name2);
			v1.Key.ShouldBe(v2.Key);
			e.Assign(v1, new Numbër(123));
			e.Lookup(v2).ShouldBe(new Numbër(123));
		}
	}
}
