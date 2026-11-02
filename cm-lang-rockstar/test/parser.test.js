import { tokens, tree, errors } from "./helpers.js";

const names = source => tokens(source).map(t => t[0]);

describe("poetic literals", () => {
	test("v1 poetic number after 'is'", () => {
		expect(tree("Tommy was a lean mean wrecking machine"))
			.toBe("Program(Assignment(Lookup(SimpleVariable),Is,V1PoeticNumber(PoeticDigit,PoeticDigit,PoeticDigit,PoeticDigit,PoeticDigit)))");
	});

	test("v1 poetic number with a decimal point", () => {
		expect(tokens("Pi is ice. A life unfilled").slice(2)).toEqual([
			["PoeticDigit", "ice"], ["V1Decimal", "."], ["PoeticDigit", "A"], ["PoeticDigit", "life"], ["PoeticDigit", "unfilled"]
		]);
	});

	test("v1 poetic numbers ignore digits and some punctuation", () => {
		expect(names("my number is a 57 + true 43")).toEqual(["CommonVariable", "Is", "PoeticDigit", "PoeticNoise", "PoeticDigit", "PoeticNoise"]);
	});

	test.each(["X is 5", "X is with 5", "X is now Y", "X is true", "X is nothing", "X is not Y", "X is like a dream", "X is \"string\""])
		("%p is not a v1 poetic number", source => {
			expect(names(source)).not.toContain("PoeticDigit".repeat(source.includes("like") ? 2 : 1));
			expect(tree(source)).not.toContain("V1PoeticNumber");
		});

	test("like introduces a poetic number", () => {
		expect(tree("X is like a dream")).toBe("Program(Assignment(Lookup(SimpleVariable),Is,PoeticLiteral(Like,PoeticNumber(PoeticDigit,PoeticDigit))))");
	});

	test("so introduces a poetic number, with an ellipsis as a decimal point", () => {
		expect(tokens("Y is so ice... a life").slice(3)).toEqual([["PoeticDigit", "ice"], ["PoeticDecimal", "..."], ["PoeticDigit", "a"], ["PoeticDigit", "life"]]);
		expect(tokens("Y is so ice… a life").slice(3)).toEqual([["PoeticDigit", "ice"], ["PoeticDecimal", "…"], ["PoeticDigit", "a"], ["PoeticDigit", "life"]]);
	});

	test("a full stop ends a 'like' poetic number", () => {
		expect(names("X is like ice. say X")).toEqual(["SimpleVariable", "Is", "Like", "PoeticDigit", "Print", "SimpleVariable"]);
	});

	test("poetic numbers can be used in expressions", () => {
		expect(tree("say 5 with like a dream")).toBe("Program(OutputStatement(Print,BinaryExpression(Number,Plus,PoeticLiteral(Like,PoeticNumber(PoeticDigit,PoeticDigit)))))");
	});

	test("a poetic number runs to the end of the line", () => {
		// as per the PEG grammar, "with" is just another poetic digit here
		expect(names("say like a dream with 5")).toEqual(["Print", "Like", "PoeticDigit", "PoeticDigit", "PoeticDigit", "PoeticNoise"]);
	});

	test("holds introduces a poetic number", () => {
		expect(tree("My heart holds a dream")).toBe("Program(NinjaString(Lookup(CommonVariable),Holds,PoeticNumber(PoeticDigit,PoeticDigit)))");
		expect(tree("My heart holds 65")).toBe("Program(NinjaString(Lookup(CommonVariable),Holds,Number))");
	});

	test("says introduces a poetic string", () => {
		expect(tokens("My heart says hello, world! (not a comment)")).toEqual([
			["CommonVariable", "My heart"], ["Says", "says"], ["PoeticString", "hello, world! (not a comment)"]
		]);
	});

	test("poetic digits can contain hyphens and apostrophes", () => {
		expect(tokens("X is like rock'n'roll well-known").slice(3)).toEqual([["PoeticDigit", "rock'n'roll"], ["PoeticDigit", "well-known"]]);
	});

	test("comments inside a poetic number are skipped", () => {
		expect(names("X is like a (comment) dream")).toEqual(["SimpleVariable", "Is", "Like", "PoeticDigit", "BlockComment", "PoeticDigit"]);
	});
});

describe("statements", () => {
	test.each([
		["listen", "ListenStatement"],
		["listen to your heart", "ListenStatement"],
		["say x", "OutputStatement"],
		["write x", "OutputStatement"],
		["debug x", "OutputStatement"],
		["@dump", "OutputStatement"],
		["call f", "CallStatement"],
		["call f with 1, 2 into x", "CallStatement"],
		["return x", "ReturnStatement"],
		["give back x", "ReturnStatement"],
		["give x back", "ReturnStatement"],
		["exit", "ExitStatement"],
		["let x be 5", "Declaration"],
		["let x be with 5, 6", "Declaration"],
		["let x = 5", "Declaration"],
		["let x", "Declaration"],
		["x = 5", "Assignment"],
		["put 5 into x", "Assignment"],
		["put 5 into x at 2", "Assignment"],
		["x is with 1, 2", "Assignment"],
		["x is now 5", "Assignment"],
		["rock the list", "Enlistment"],
		["rock the list with 1, 2, 3", "Enlistment"],
		["push 5 into the list", "Enlistment"],
		["roll the list into x", "Enlistment"],
		["build x up", "Crement"],
		["build x up, up up", "Crement"],
		["knock x down, down", "Crement"],
		["cut x", "Mutation"],
		["split x into y with z", "Mutation"],
		["cast x into y", "Mutation"],
		["join the list with z into x", "Mutation"],
		["turn up x", "Rounding"],
		["turn x round", "Rounding"],
		["turn around x", "Rounding"],
		["x holds 65", "NinjaString"],
		["x taking 1, 2", "ExpressionStatement"],
		["pop the list", "ExpressionStatement"],
	])("%p", (source, statement) => {
		expect(errors(source)).toEqual([]);
		expect(tree(source)).toMatch(new RegExp(`^Program\\(${statement}\\(`));
	});

	test("function definition", () => {
		const source = "Midnight takes your heart and your soul\nGive back your heart, yeah\n";
		expect(errors(source)).toEqual([]);
		expect(tree(source)).toBe("Program(FunctionDefinition(FunctionName(SimpleVariable),Takes,ParamList(CommonVariable,AndSep,CommonVariable),Block(EOS,ReturnStatement(Return,Back,Lookup(CommonVariable)),Noise,EOB)),EOS)");
	});

	test("function taking nothing", () => {
		expect(tree("F takes nothing give back 1")).toBe("Program(FunctionDefinition(FunctionName(SimpleVariable),Takes,Null,ReturnStatement(Return,Back,Number)))");
	});

	test.each(["break", "Break it down", "continue", "Take it to the top"])("%p", source => {
		expect(errors(source)).toEqual([]);
	});

	test("break wildcard", () => {
		expect(tokens("break it down")).toEqual([["Break", "break"], ["Wildcard", "it down"]]);
	});
});

describe("blocks", () => {
	test.each([
		["end", "if x\nsay x\nend\nsay y"],
		["yeah", "if x\nsay x\nyeah\nsay y"],
		["baby", "if x\nsay x, baby\nsay y"],
		["oh", "if x\nsay x\noh\nsay y"],
		["a blank line", "if x\nsay x\n\nsay y"],
		["a comment-only line", "if x\nsay x\n(end if)\nsay y"],
	])("a block can end with %s", (_, source) => {
		expect(errors(source)).toEqual([]);
		expect(tree(source)).toMatch(/^Program\(Conditional\(.*\),(BlockComment,)?EOS,OutputStatement\(Print,Lookup\(SimpleVariable\)\)\)$/);
	});

	test("ooh ends two blocks", () => {
		const source = "if x\nif y\nsay x\nooh\nsay y";
		expect(errors(source)).toEqual([]);
		expect(names(source).filter(n => n == "EOB")).toHaveLength(2);
		expect(tree(source)).toMatch(/\),EOS,OutputStatement\(Print,Lookup\(SimpleVariable\)\)\)$/);
	});

	test("blocks still open at the end of the file are closed", () => {
		expect(errors("while x\nif y\nsay x\n")).toEqual([]);
	});

	test("else closes the block", () => {
		const source = "if x\nsay 1\nelse\nsay 2\nend";
		expect(errors(source)).toEqual([]);
		expect(tree(source)).toBe("Program(Conditional(If,Lookup(SimpleVariable),Block(EOS,OutputStatement(Print,Number),EOS,EOB),Else,Block(EOS,OutputStatement(Print,Number),EOS,EOB)))");
	});

	test("one-liners with else", () => {
		const source = "if 1 if 2 say 4 else say 3 else say 0";
		expect(errors(source)).toEqual([]);
		expect(tree(source)).toBe("Program(Conditional(If,Number,Conditional(If,Number,OutputStatement(Print,Number),Else,OutputStatement(Print,Number)),Else,OutputStatement(Print,Number)))");
	});

	test("a comma starts a block", () => {
		expect(errors("If x, say y, yeah")).toEqual([]);
	});

	test("loops", () => {
		for (const source of [
			"while x say x",
			"until x\nsay x\n",
			"for every x in the list\nsay x\n",
			"for x and i of the list say i",
		]) expect(errors(source)).toEqual([]);
	});
});

describe("expressions", () => {
	test("primary lists after arithmetic operators", () => {
		expect(tree("say x with 1, 2, 3")).toBe("Program(OutputStatement(Print,BinaryExpression(Lookup(SimpleVariable),Plus,PrimaryList(Number,ListSep,Number,ListSep,Number))))");
	});

	test("function call arguments are primaries", () => {
		expect(tree("say f taking 1, 2 times 3")).toBe("Program(OutputStatement(Print,BinaryExpression(FunctionCall(FunctionName(SimpleVariable),Taking,ArgList(Number,ListSep,Number)),Times,Number)))");
	});

	test("indexes", () => {
		expect(tree("say x at 1 at 2")).toBe("Program(OutputStatement(Print,Lookup(SimpleVariable,Index(At,Number),Index(At,Number))))");
		// PEG: indexes are greedy, so this is x[y[2]]
		expect(tree("say x at y at 2")).toBe("Program(OutputStatement(Print,Lookup(SimpleVariable,Index(At,Lookup(SimpleVariable,Index(At,Number))))))");
		expect(errors("put 5 into my list at 2")).toEqual([]);
	});

	test("precedence", () => {
		expect(tree("say 1 plus 2 times 3")).toBe("Program(OutputStatement(Print,BinaryExpression(Number,Plus,BinaryExpression(Number,Times,Number))))");
		expect(tree("say x is 1 and y is not 2")).toBe("Program(OutputStatement(Print,BinaryExpression(BinaryExpression(Lookup(SimpleVariable),Is,Number),And,BinaryExpression(Lookup(SimpleVariable),Is,UnaryExpression(Not,Number)))))");
	});

	test("constants", () => {
		expect(names("say true or right or yes or ok or false or lies or wrong or no or null or nothing or gone or empty or silence or mysterious").filter(n => n != "Or"))
			.toEqual(["Print", "True", "True", "True", "True", "False", "False", "False", "False", "Null", "Null", "Null", "Empty", "Empty", "Mysterious"]);
	});
});
