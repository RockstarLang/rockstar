import { tokens, tokenFor } from "./helpers.js";

describe("keywords are case-insensitive", () => {
	test.each(["shout x", "Print x", "ScreAM x", "whisper x", "say x"])("%p", source => {
		expect(tokens(source)[0][0]).toBe("Print");
	});
});

describe("variables", () => {
	test.each(["the night", "a girl", "A BOY", "My Lies", "your love", "his word", "her hair", "an orange", "AN HONOUR", "Their guitars", "OUR FLAG"])
		("%p is a common variable", v => expect(tokenFor(`say ${v}`, v)).toBe("CommonVariable"));

	test.each(["x", "y", "foo", "bar", "myVariable", "Midnight", "MyVariable", "x2", "under_score"])
		("%p is a simple variable", v => expect(tokenFor(`say ${v}`, v)).toBe("SimpleVariable"));

	test.each(["Johnny B. Goode", "Black Betty", "Billie Jean", "JRR Tolkien", "Doctor Feelgood"])
		("%p is a proper variable", v => expect(tokenFor(`say ${v}`, v)).toBe("ProperVariable"));

	test.each(["they", "them", "she", "him", "her", "hir", "zie", "zir", "xem", "ver", "ze", "ve", "xe", "it", "he", "you", "me", "i"])
		("%p is a pronoun", v => expect(tokenFor(`say ${v}`, v)).toBe("Pronoun"));

	test.each(["arguments", "the world", "the outside"])
		("%p is the arguments", v => expect(tokenFor(`say ${v}`, v)).toBe("Arguments"));

	test("'her' before a keyword is a pronoun", () => {
		expect(tokens("say her with 5")).toEqual([["Print", "say"], ["Pronoun", "her"], ["Plus", "with"], ["Number", "5"]]);
	});

	test("a proper variable stops at a keyword", () => {
		expect(tokens("Tommy Gun Is 5")[0]).toEqual(["ProperVariable", "Tommy Gun"]);
	});

	// The PEG's `less` and `more` rules lack a !letter guard on some aliases,
	// so the engine sees these words as starting with a keyword.
	test.each(["lowercase", "biggerish", "greaterthan"])("%p can't be a simple variable", v => {
		expect(tokenFor(`say ${v}`, v)).not.toBe("SimpleVariable");
	});
});

describe("context-dependent words", () => {
	test("with is addition in an expression", () => expect(tokenFor("say x with 1", "with")).toBe("Plus"));
	test("with is 'using' in a push statement", () => expect(tokenFor("rock the list with 1, 2", "with")).toBe("Using"));
	test("with is addition in 'push x with y into z'", () => expect(tokenFor("rock x with 1 into the list", "with")).toBe("Plus"));
	test("with in a call statement", () => expect(tokenFor("call f with 1, 2", "with")).toBe("With"));
	test("with is 'using' in a mutation", () => expect(tokenFor("cut my string with the knife", "with")).toBe("Using"));

	test("say at the start of a statement is print", () => expect(tokenFor("say hello", "say")).toBe("Print"));
	test("say after a variable starts a poetic string", () => expect(tokenFor("my heart say hello", "say")).toBe("Says"));

	test("in is 'into' in a put statement", () => expect(tokenFor("put 1 in x", "in")).toBe("Into"));
	test("in is part of a for loop", () => expect(tokenFor("for x in y say x", "in")).toBe("In"));
	test("of is multiplication in an expression", () => expect(tokenFor("say 2 of 3", "of")).toBe("Times"));
	test("of is part of a for loop", () => expect(tokenFor("for x of y say x", "of")).toBe("Of"));
	test("over is division in an expression", () => expect(tokenFor("say 6 over 3", "over")).toBe("DividedBy"));
	test("over is a comparison after 'is'", () => expect(tokenFor("if x is over 3 say x", "over")).toBe("Above"));
	test("divided by is a single operator", () => expect(tokenFor("say 6 divided by 3", "divided by")).toBe("DividedBy"));
	test("'s is 'is'", () => expect(tokens("Tommy's 5").slice(0, 2)).toEqual([["SimpleVariable", "Tommy"], ["Is", "'s"]]));
	test("isn't is a single keyword", () => expect(tokenFor("if x isn't 5 say x", "isn't")).toBe("Isnt"));
	test("take is continue at the start of a statement", () => expect(tokenFor("while x take it to the top", "take")).toBe("Continue"));
	test("signed numbers", () => expect(tokenFor("X is -5", "-5")).toBe("Number"));
	test("subtraction isn't a signed number", () => expect(tokens("say 5-2")).toEqual([["Print", "say"], ["Number", "5"], ["-", "-"], ["Number", "2"]]));
});

describe("operators", () => {
	test.each(["+", "plus", "with", "WITH", "-", "minus", "without", "*", "times", "of", "/", "divided by", "between", "over"])
		("%p is arithmetic", op => {
			const [name] = tokens(`say x ${op} y`)[2];
			expect(["Plus", "Minus", "Times", "DividedBy", "+", "-", "*", "/"]).toContain(name);
		});

	test.each([
		"is as great as", "IS AS HIGH AS", "is as big as", "is as strong as",
		"is as low as", "is as small as", "is as weak as", "is as less as",
		"is stronger than", "is more than", "is greater than", "is higher than", "is bigger than",
		"is weaker than", "is lower than", "is smaller than", "is less than",
		"is above", "is over", "is below", "is under",
		">=", "<=", ">", "<", "=", "!=", "is", "isn't", "ain't", "is exactly", "is totally", "is really"
	])("%p is a comparison", op => {
		expect(tokens(`if x ${op} y say x`).map(t => t[0])).not.toContain("⚠");
	});
});

describe("separators", () => {
	test.each([", ", " & ", " 'n' ", " n' ", ", & ", ", 'n' ", ", n' ", ", and "])("%p separates arguments", sep => {
		const result = tokens(`say f taking 1${sep}2`);
		expect(result.map(t => t[0])).toEqual(["Print", "SimpleVariable", "Taking", "Number", "ListSep", "Number"]);
	});

	test("rhythm'n'blues is three parameters", () => {
		const result = tokens("Success takes blood, sweat & rhythm'n'blues\nsay blood\n");
		expect(result.filter(t => t[0] == "SimpleVariable").map(t => t[1]).slice(1, 5)).toEqual(["blood", "sweat", "rhythm", "blues"]);
	});
});

describe("comments", () => {
	test.each(["(a comment)", "(nested (comment))", "{chordpro}", "[chordpro]"])("%p is a block comment", c => {
		expect(tokenFor(`say x ${c}`, c)).toBe("BlockComment");
	});
	test("# starts a line comment", () => expect(tokenFor("say x # comment", "# comment")).toBe("LineComment"));
});
