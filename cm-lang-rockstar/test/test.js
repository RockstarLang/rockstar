import * as rockstar from "../src/tokenizers/rockstar-lexer.js"
import * as tokens from "../src/grammars/rockstar.terms";

const oooh = ["oh", "oooh", "ooooh"];

test.each(oooh)("%p ends a block", (source) => {
	var input = new parserInput(source);
	rockstar.tokenizeEOB(input);
	expect(input.token).toBe(tokens.EOB);
	expect(input.pos).toBe(1);
});


const notEndOfStatement = [
	" & ",
	" 'n' ",
	" n' ",
//	", ",
	", &",
	", 'n'",
	", n' ",
	", and" ]
test.each(notEndOfStatement)("%s does NOT end a statement", (source) => {
	source = source.replace(/\\r/g, "\r").replace(/\\n/g, "\n");
	var input = new parserInput(source);
	rockstar.tokenizeEOS(input);
	console.log(input.token);
	expect(input.token).not.toBe(tokens.EOS);
});

const endOfStatementsWithSubsequentKeyword = [
	[ ". Say it. ", 2 ],
	[ "... print X", 4 ],
	[ "??? Let X be 5", 4 ],
	[ "!?;!...?     Say X", 13 ]
];
test.each(endOfStatementsWithSubsequentKeyword)("%s ends a statement at position %[", (source, tokenTo) => {
	source = source.replace(/\\r/g, "\r").replace(/\\n/g, "\n");
	var input = new parserInput(source);
	rockstar.tokenizeEOS(input);
	expect(input.token).toBe(tokens.EOS);
	expect(input.pos).toBe(tokenTo);
	//expect(input.tokenTo).toBe(tokenTo);
});


const endOfStatements = [ "\\n", "\\r\\n", "!", ";", "?", "...\\n", "...\\r\\n", "!\r\n", "?!?\\r\\n" ];
test.each(endOfStatements)("%s ends a statement", (source) => {
	source = source.replace(/\\r/g, "\r").replace(/\\n/g, "\n");
	var input = new parserInput(source);
	rockstar.tokenizeEOS(input);
	expect(input.token).toBe(tokens.EOS);
});

const endOfBlocks = ["\\nyeah", "\\nEnd", "end", "yeah", "baby", "oh", ", end", ", yeah!", ".... yeah!", "\\r\\nelse", "\\r\\n\\r\\n", "\\n\\n", "\\n\\r\\n", "\\r\\nEnd", "\\r\\nBaby", "\\r\\nOh yeah baby"]
test.each(endOfBlocks)("%s ends a block", (source) => {
	source = source.replace(/\\r/g, "\r").replace(/\\n/g, "\n");
	var input = new parserInput(source);
	rockstar.tokenizeEOB(input);
	expect(input.token).toBe(tokens.EOB);
});

const validPoeticNumbers = [ "'rock'", "a lovestruck ladykiller", "the sands of time", "ice. A life unfilled"];
test.each(validPoeticNumbers)("%p is a poetic number", (lexeme) => {
	var input = new parserInput(lexeme);
	rockstar.tokenizePoeticNumber(input);
	expect(input.token).toBe(tokens.PoeticNumber);
});

const invalidPoeticNumbers = ["with a dream", "without fear", "times of no trust", "5"]

test.each(invalidPoeticNumbers)("%p is not a poetic number", (lexeme) => {
	var input = new parserInput(lexeme);
	rockstar.tokenizePoeticNumber(input);
	expect(input.token).not.toBe(tokens.PoeticNumber);
});


const cases = [
	[["shout", "Print", "ScreAM"], tokens.Print]
];

describe("tokenizer", () => {
	describe.each(cases)("%p all match", (lexemes, token) => {
		test.each(lexemes)("%p", (lexeme) => {
			var input = new parserInput(lexeme);
			rockstar.tokenizeKeyword(input);
			expect(input.token).toBe(token);
		});
	});
});

const operators = [
	[tokens.ArithmeticOperator, [
		"+", "plus", "with", "WITH", "plUs",
		"-", "minus", "without", "MInus",
		"*", "times", "of", "tiMES",
		"/", "divided by", "divided    by", "DIVIDED BY"
	]],
	[tokens.CompareOperator, [
		">=", "is as great as", "IS AS HIGH AS", "is       as BIG as", "IS as strOnG as",
		"<=", "is as low as", "is as SMALL as", "Is As Weak As",
		">", "is stronger than", "is MOre Than", "is GREATER THAN", "IS bigger ThAN", "IS highEr ThAn", "is above",
		"<", "IS WEAKER THAN", "is lower than", "is below", "is under", "is LESS than"
	]],
	[tokens.LogicOperator, [
		"and", "or", "nor"
	]]
];

describe.each(operators)("%p is operator ", (token, lexemes) => {
	test.each(lexemes)("%p", (lexeme) => {
		var input = new parserInput(lexeme);
		rockstar.tokenizeOperator(input);
		expect(input.token).toBe(token);
	});
});

const notOperators = [ "1 say 2", "e" ];
test.each(notOperators)("%p is not an operator ", (source) => {
	var input = new parserInput(source);
	rockstar.tokenizeOperator(input);
	expect(input.token).toBe(undefined);
});

const notAnyKindOfVariables = ["true", "false", "1", "+2", "-5", "\n", " ", "\t", "12345", "!"]
test.each(notAnyKindOfVariables)("%p is NOT any kind of variable", (lexeme) => {
	var input = new parserInput(lexeme);
	rockstar.tokenizeVariable(input);
	expect(input.token).toBe(undefined);
});

const notCommonVariables = ["his right", "her times"];
test.each(notCommonVariables)("%p is NOT a common variable", (lexeme) => {
	var input = new parserInput(lexeme);
	rockstar.tokenizeVariable(input);
	expect(input.token).not.toBe(tokens.CommonVariable);
});

const commonVariables = ["the night", "a girl", "A BOY", "My Lies", "your love", "his word", "her hair", "an orange", "AN HONOUR",
	"Their guitars", "OUR FLAG" ];
test.each(commonVariables)("%p is a proper variable", (lexeme) => {
	var input = new parserInput(lexeme);
	rockstar.tokenizeVariable(input);
	expect(input.token).toBe(tokens.CommonVariable);
});

const simpleVariables = ["x", "y", "foo", "bar", "myVariable", "Midnight", "MyVariable" ];
test.each(simpleVariables)("%p is a simple variable", (lexeme) => {
	var input = new parserInput(lexeme);
	rockstar.tokenizeVariable(input);
	expect(input.token).toBe(tokens.SimpleVariable);
});

const notSimpleVariables = ["say", "times", "Big Daddy", "my leg" ];
test.each(notSimpleVariables)("%p is NOT a simple variable", (lexeme) => {
	var input = new parserInput(lexeme);
	rockstar.tokenizeVariable(input);
	expect(input.token).not.toBe(tokens.SimpleVariable);
});

const notProperVariables = ["My Dad", "Your Lies", "Scream II" ];
test.each(notProperVariables)("%p is NOT a proper variable", (lexeme) => {
	var input = new parserInput(lexeme);
	rockstar.tokenizeVariable(input);
	expect(input.token).not.toBe(tokens.ProperVariable);
});

const properVariables = ["Johnny B. Goode", "Dr. Feelgood", "Black Betty", "Billie Jean", "JRR Tolkien" ];
test.each(properVariables)("%p is a proper variable", (lexeme) => {
	var input = new parserInput(lexeme);
	rockstar.tokenizeVariable(input);
	expect(input.token).toBe(tokens.ProperVariable);
});

const pronouns = ['they', 'them', 'she', 'him', 'her', 'hir', 'zie', 'zir', 'xem', 'ver', 'ze', 've', 'xe', 'it', 'he', 'you', 'me', 'i'];
test.each(pronouns)("%p is a pronoun", (lexeme) => {
	var input = new parserInput(lexeme);
	rockstar.tokenizeVariable(input);
	expect(input.token).toBe(tokens.Pronoun);
});

class parserInput {
	#token;
	#s;
	#i = 0;
	#tokenTo = 0;
	constructor(s) { this.#s = s; }
	get token() { return this.#token; }
	get tokenTo() { return this.#tokenTo; }
	get next() { return this.#i >= this.#s.length ? -1 : this.#s.charCodeAt(this.#i); }
	get pos() { return this.#i; }
	peek = (offset = 0) => (this.#i + offset < this.#s.length ? this.#s.charCodeAt(this.#i + offset) : -1);
	advance = (offset = 1) => {
		this.#i += offset;
		return this.next;
	}
	acceptToken = (token) => this.#token = token;
	acceptTokenTo = (token, tokenTo) => {
		this.#token = token;
		this.#tokenTo = tokenTo;
	}
}
