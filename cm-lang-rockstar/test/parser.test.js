import * as rockstar from "../src/tokenizers/rockstar-lexer.js"
import * as tokens from "../src/grammars/rockstar.terms.js";

import { parser } from "../src/grammars/rockstar.js";

test("parse", () => {
	let result = parser.parse("say 1 say 2");
	console.log(result.toString());
});

test("argument separators aren't EOS", () => {
	let result = parser.parse("Call my function with 1, 2, & 3, 'n' 4, n' 5 & 6 'n' 7 n' 8, and 9");
	console.log(result.toString());
	expect(result.toString()).not.toContain("EOS");
});


