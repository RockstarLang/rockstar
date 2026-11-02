// Contextual tokenizer for Rockstar.
//
// Every decision here is driven by `stack.canShift(term)`: we only ever emit a
// token the parser can accept at this point, and that is how we resolve
// Rockstar's many context-dependent words. The rules mirror
// Starship/Rockstar.Engine/rockstar.peg; comments reference the PEG rule names.

import * as T from "../grammars/rockstar.terms.js";
import { KW, is, isKeyword, isEndOfBlock, canBeginV1PoeticNumber } from "./keywords.js";

const TAB = 9, LF = 10, CR = 13, SPACE = 32;
const APOSTROPHE = 39, HYPHEN = 45, FULL_STOP = 46, ELLIPSIS = 0x2026;

const ch = c => (c < 0 ? "" : String.fromCharCode(c));
const isSpace = c => c == SPACE || c == TAB;
const isNewline = c => c == LF || c == CR;
const isEnd = c => c < 0 || isNewline(c);
const isDigit = c => c >= 48 && c <= 57;
const isUpper = c => c >= 0 && /\p{Lu}/u.test(ch(c));
const isLetter = c => c >= 0 && /[\p{Lu}\p{Ll}]/u.test(ch(c));
const isIdentChar = c => isLetter(c) || isDigit(c) || c == 95; // identifier = letter (letter / [0-9_])*
const isPoeticDigitChar = c => isLetter(c) || c == HYPHEN || c == APOSTROPHE; // poetic_digit
const isPoeticSeparator = c => isDigit(c) || ",;:?!+_/".includes(ch(c)) && c >= 0; // PDS
const isStatementPunctuation = c => c >= 0 && ".?!;:".includes(ch(c)); // EOS
const isFiller = c => isSpace(c) || c >= 0 && ",.?!;:".includes(ch(c)); // filler

// ------------------------------------------------------------- input helpers

function skipSpaces(input, off) {
	while (isSpace(input.peek(off))) off++;
	return off;
}

// Read an identifier-like word starting exactly at `off`.
function readWord(input, off) {
	if (!isLetter(input.peek(off))) return null;
	let start = off, text = "";
	while (isIdentChar(input.peek(off))) text += ch(input.peek(off++));
	return { start, end: off, text, lower: text.toLowerCase() };
}

// Read the next word after at least one space (the PEG's `_`).
function nextWord(input, off) {
	const start = skipSpaces(input, off);
	if (start == off) return null;
	return readWord(input, start);
}

// Read the next word on the same line, skipping any punctuation and spaces.
function nextWordOnLine(input, off) {
	while (!isEnd(input.peek(off)) && !isLetter(input.peek(off))) off++;
	return readWord(input, off);
}

function endOfLine(input, off) {
	while (!isEnd(input.peek(off))) off++;
	return off;
}

// Skip a block comment ( ... ), which may be nested, or a chordpro comment
// { ... } or [ ... ]. Returns the offset just past it, or -1 if there isn't one.
function skipBlockComment(input, off) {
	const c = input.peek(off);
	if (c == 40) { // (
		let depth = 0;
		for (; ; off++) {
			const d = input.peek(off);
			if (d < 0) return off;
			if (d == 40) depth++;
			if (d == 41 && --depth == 0) return off + 1;
		}
	}
	if (c == 123 || c == 91) { // { or [
		const close = c == 123 ? 125 : 93;
		for (off++; ; off++) {
			const d = input.peek(off);
			if (d < 0) return off;
			if (d == close) return off + 1;
		}
	}
	return -1;
}

// ------------------------------------------------------------------ keywords

// The token(s) each keyword rule produces. Where one word belongs to several
// rules (e.g. "with" is plus, using and with) the order here is the order we
// try them in, which follows the PEG's ordered choices.
const RULE_TERMS = [
	["says", T.Says], ["print", T.Print],
	["in", T.In], ["into", T.Into],
	["of", T.Of], ["times", T.Times],
	["above", T.Above], ["divided_by", T.DividedBy],
	["less", T.Less], ["as_small", T.AsSmall],
	["and", T.And],
	["plus", T.Plus], ["using", T.Using], ["with", T.With],
	["around", T.Around], ["as", T.As], ["as_great", T.AsGreat], ["at", T.At],
	["back", T.Back], ["be", T.Be], ["break", T.Break], ["build", T.Build],
	["call", T.Call], ["cast", T.Cast], ["continue", T.Continue], ["debug", T.Debug],
	["down", T.Down], ["empty", T.Empty], ["every", T.Every], ["exit", T.Exit],
	["exactly", T.Exactly], ["false", T.False], ["for", T.For], ["holds", T.Holds],
	["if", T.If], ["is", T.Is], ["isnt", T.Isnt], ["join", T.Join], ["knock", T.Knock],
	["let", T.Let], ["like", T.Like], ["listen", T.Listen], ["minus", T.Minus],
	["more", T.More], ["mysterious", T.Mysterious], ["non", T.Non], ["nor", T.Nor],
	["not", T.Not], ["now", T.Now], ["null", T.Null], ["or", T.Or], ["pop", T.Pop],
	["push", T.Push], ["put", T.Put], ["return", T.Return], ["roll", T.Roll],
	["split", T.Split], ["takes", T.Takes], ["taking", T.Taking], ["than", T.Than],
	["then", T.Then], ["to", T.To], ["true", T.True], ["turn", T.Turn],
	["under", T.Under], ["until", T.Until], ["up", T.Up], ["while", T.While],
	["write", T.Write],
];

const CANDIDATES = new Map();
for (const [rule, term] of RULE_TERMS) {
	for (const word of KW[rule]) {
		if (!CANDIDATES.has(word)) CANDIDATES.set(word, []);
		if (!CANDIDATES.get(word).includes(term)) CANDIDATES.get(word).push(term);
	}
}

// Keywords that start a statement and can't start an expression; used to tell
// a list separator comma from a comma that starts a block ("If x, say y").
const STATEMENT_KEYWORDS = new Set([
	"print", "put", "listen", "return", "break", "continue", "let", "if", "while",
	"until", "for", "push", "build", "knock", "split", "cast", "join", "turn",
	"exit", "call", "debug", "write", "else", "end"
].flatMap(r => KW[r]));

// ------------------------------------------------------------------- the lexer

export function tokenize(input, stack) {
	const can = term => stack.canShift(term);
	const c = input.next;

	if (c < 0) {
		// EOF ends every open block (PEG: EOB = ... / EOF)
		if (can(T.EOB)) input.acceptToken(T.EOB);
		return;
	}
	if (isSpace(c)) return; // whitespace is handled by the grammar's skip rule

	// poetic_string: everything up to the end of the line.
	if (can(T.PoeticString) && !isNewline(c)) {
		return input.acceptToken(T.PoeticString, endOfLine(input, 0));
	}

	// break/continue wildcard: anything up to the end of the statement.
	if (can(T.Wildcard) && !isEnd(c) && !",.?!;".includes(ch(c))) {
		let off = 0;
		while (!isEnd(input.peek(off)) && !",.?!;".includes(ch(input.peek(off)))) off++;
		return input.acceptToken(T.Wildcard, off);
	}

	// Comments
	if (c == 35) return input.acceptToken(T.LineComment, endOfLine(input, 0)); // #
	const commentEnd = skipBlockComment(input, 0);
	if (commentEnd > 0) return input.acceptToken(T.BlockComment, commentEnd);

	if (can(T.PoeticDigit) && tokenizePoeticNumber(input, stack)) return;

	if (c == 44 || isStatementPunctuation(c) || isNewline(c)) return tokenizePunctuation(input, stack);

	// digits = ('-' / '+')? [0-9]+ ("." [0-9]+)? / ('-' / '+')? "." [0-9]+
	// The sign is only part of the number where a number can start, so
	// "5-2" is a subtraction but "X is -5" assigns minus five.
	if ((c == 43 || c == HYPHEN) && can(T.Number)) {
		let off = 1;
		const digits = () => { const s = off; while (isDigit(input.peek(off))) off++; return off > s; };
		const whole = digits();
		if (input.peek(off) == FULL_STOP && isDigit(input.peek(off + 1))) { off++; digits(); }
		else if (!whole) off = 0;
		if (off > 1) return input.acceptToken(T.Number, off);
	}

	if (c == 38) { // &
		if (can(T.ListSep)) return input.acceptToken(T.ListSep, 1);
		return;
	}

	if (c == APOSTROPHE) return tokenizeApostrophe(input, stack);

	if (isLetter(c)) return tokenizeWord(input, stack);
}

// --------------------------------------------------------- poetic numbers

// Called when the parser can accept a PoeticDigit: we're after "like", "so" or
// "holds", or in a v1 poetic number after "is" (`Tommy was a big bad monster`),
// or somewhere in the middle of one of those.
function tokenizePoeticNumber(input, stack) {
	const can = term => stack.canShift(term);
	const c = input.next;
	// If the parser could also accept a variable, this is the start of a v1
	// poetic number, which is only valid if it doesn't look like an expression.
	const v1Start = can(T.SimpleVariable);

	if (isPoeticDigitChar(c)) {
		if (v1Start) {
			if (!isLetter(c)) return false;
			const word = readWord(input, 0);
			const next = nextWord(input, word.end);
			if (!canBeginV1PoeticNumber(word.text, next?.text)) return false;
		}
		let off = 0;
		while (isPoeticDigitChar(input.peek(off))) off++;
		input.acceptToken(T.PoeticDigit, off);
		return true;
	}
	if (v1Start) return false;

	// Is there another poetic digit after some whitespace, on this line?
	const digitFollows = off => {
		const start = off;
		off = skipSpaces(input, off);
		return off > start && isPoeticDigitChar(input.peek(off));
	};

	// v1 decimal separator is a single '.'; v2 is '...' or '…'
	if (c == FULL_STOP && can(T.V1Decimal) && digitFollows(1)) {
		input.acceptToken(T.V1Decimal, 1);
		return true;
	}
	if (can(T.PoeticDecimal)) {
		if (c == FULL_STOP && input.peek(1) == FULL_STOP && input.peek(2) == FULL_STOP && digitFollows(3)) {
			input.acceptToken(T.PoeticDecimal, 3);
			return true;
		}
		if (c == ELLIPSIS && digitFollows(1)) {
			input.acceptToken(T.PoeticDecimal, 1);
			return true;
		}
	}

	// PDS: digits and some punctuation are ignored in poetic numbers. A trailing
	// run is fine too, unless we're at the start of a number ("X holds 5").
	if (isPoeticSeparator(c)) {
		let off = 0;
		while (isPoeticSeparator(input.peek(off)) || isSpace(input.peek(off))) off++;
		const d = input.peek(off);
		if (isPoeticDigitChar(d) || (!can(T.Number) && (isEnd(d) || isStatementPunctuation(d)))) {
			input.acceptToken(T.PoeticNoise, off);
			return true;
		}
	}
	return false;
}

// ------------------------------------------------------------- punctuation

function tokenizePunctuation(input, stack) {
	const can = term => stack.canShift(term);
	const c = input.next;

	if (c == FULL_STOP && isDigit(input.peek(1)) && can(T.Number)) return; // .5
	if (c == 33 && input.peek(1) == 61) return; // !=

	if (c == 44) { // comma
		const after = skipSpaces(input, 1);
		const n = input.peek(after);
		const endsLine = isEnd(n) || isStatementPunctuation(n);
		const word = readWord(input, after);
		// ", yeah" and ", else" - the comma is just filler before the end of a block
		const endsBlock = word && (isEndOfBlock(word.lower) || is("else", word.lower));
		if (!endsLine && !endsBlock && (can(T.ListSep) || can(T.Comma))) {
			const startsStatement = word && STATEMENT_KEYWORDS.has(word.lower);
			if (can(T.ListSep) && !(can(T.Comma) && startsStatement)) {
				// _XLS_ and _ALS_: ", and"  ", &"  ", n'"  ", 'n'"  or just ","
				if (word?.lower == "and") return input.acceptToken(T.ListSep, word.end);
				if (n == 38) return input.acceptToken(T.ListSep, after + 1);
				if (word?.lower == "n" && input.peek(word.end) == APOSTROPHE) return input.acceptToken(T.ListSep, word.end + 1);
				if (n == APOSTROPHE && (input.peek(after + 1) | 32) == 110 && input.peek(after + 2) == APOSTROPHE) {
					return input.acceptToken(T.ListSep, after + 3);
				}
				return input.acceptToken(T.ListSep, 1);
			}
			if (can(T.Comma)) return input.acceptToken(T.Comma, 1);
		}
	}

	// Scan the whole run of filler, statement punctuation and newlines.
	let off = 0, terminated = false, firstNewline = -1;
	for (; ;) {
		const d = input.peek(off);
		if (isSpace(d) || d == 44) off++;
		else if (isStatementPunctuation(d)) {
			if (d == 33 && input.peek(off + 1) == 61) break; // !=
			if (d == FULL_STOP && isDigit(input.peek(off + 1))) break; // .5
			terminated = true;
			off++;
		} else if (d == CR) off++;
		else if (d == LF) {
			terminated = true;
			if (firstNewline < 0) firstNewline = off;
			off++;
		} else break;
	}
	if (!terminated) return input.acceptToken(T.Noise, off); // stray commas

	// An "else" on the next line belongs to the current conditional.
	const following = readWord(input, skipSpaces(input, off));
	if (following && is("else", following.lower) && can(T.Else)) return input.acceptToken(T.Noise, off);

	// EOB: EOL &EOL - a blank line (or a line with only a comment) ends a block.
	if (firstNewline >= 0 && can(T.EOB) && isBlankLine(input, firstNewline + 1)) {
		return input.acceptToken(T.EOB, firstNewline + 1);
	}
	return input.acceptToken(T.EOS, off);
}

// Does the line starting at `off` contain only filler and comments?
function isBlankLine(input, off) {
	for (; ;) {
		const d = input.peek(off);
		if (d == LF || d == CR) return true;
		if (d < 0) return false;
		if (isFiller(d)) { off++; continue; }
		if (d == 35) { // a line comment includes its own newline in the PEG grammar
			off = endOfLine(input, off);
			if (input.peek(off) == CR) off++;
			if (input.peek(off) == LF) off++;
			continue;
		}
		const end = skipBlockComment(input, off);
		if (end < 0) return false;
		off = end;
	}
}

// 'n' (list separator) and 's / 're (contractions of "is")
function tokenizeApostrophe(input, stack) {
	const can = term => stack.canShift(term);
	const a = input.peek(1) | 32, b = input.peek(2);
	if (a == 110 && b == APOSTROPHE && can(T.ListSep)) return input.acceptToken(T.ListSep, 3);
	if (a == 115 && !isLetter(b) && can(T.Is)) return input.acceptToken(T.Is, 2);
	if (a == 114 && (b | 32) == 101 && !isLetter(input.peek(3)) && can(T.Is)) return input.acceptToken(T.Is, 3);
}

// ------------------------------------------------------------------- words

function tokenizeWord(input, stack) {
	const can = term => stack.canShift(term);
	const word = readWord(input, 0);
	const lower = word.lower;

	// Contractions: isn't, ain't, wasn't, aren't, weren't
	if (input.peek(word.end) == APOSTROPHE && isLetter(input.peek(word.end + 1))) {
		const tail = readWord(input, word.end + 1);
		if (is("isnt", lower + "'" + tail.lower)) return input.acceptToken(T.Isnt, tail.end);
	}
	// n' list separator
	if (lower == "n" && input.peek(word.end) == APOSTROPHE && can(T.ListSep)) {
		return input.acceptToken(T.ListSep, word.end + 1);
	}

	// end, yeah, baby, oh, and ooh (where each 'o' closes a block)
	if (isEndOfBlock(lower)) {
		if (can(T.EOB)) return input.acceptToken(T.EOB, /^oo+h$/.test(lower) ? 1 : word.end);
		return input.acceptToken(T.StrayEnd, word.end);
	}

	if (is("else", lower)) {
		if (can(T.Else)) return input.acceptToken(T.Else, word.end);
		if (can(T.EOB)) return input.acceptToken(T.EOB, 0); // EOB: &(_? else)
		return input.acceptToken(T.Else, word.end);
	}

	// "..., oh baby, whisper my heart": a statement can follow the end of a
	// block on the same line, without an EOS in between.
	if (can(T.glue) && followsEndOfBlock(input)) return input.acceptToken(T.glue, 0);

	const next = nextWord(input, word.end);

	if (lower == "divided" && next?.lower == "by" && can(T.DividedBy)) {
		return input.acceptToken(T.DividedBy, next.end);
	}
	if (lower == "non" && input.peek(word.end) == HYPHEN && can(T.Non)) {
		return input.acceptToken(T.Non, word.end + 1);
	}

	const candidates = CANDIDATES.get(lower) ?? [];
	let shiftable = candidates.filter(can);

	// "with" can be addition or "using" in push and mutation statements. The
	// PEG tries the "... into target" form first, so it's addition if there's
	// an "into" later on the line.
	if (shiftable.includes(T.Plus) && shiftable.includes(T.Using)) {
		const preferred = hasIntoLaterOnLine(input, word.end) ? T.Plus : T.Using;
		return input.acceptToken(preferred, word.end);
	}
	if (shiftable.length) return input.acceptToken(shiftable[0], word.end);

	// "and" in a parameter list or a for loop index (_VLS_, _and_index)
	if (lower == "and" && can(T.AndSep)) return input.acceptToken(T.AndSep, word.end);

	if (can(T.SimpleVariable)) {
		const variable = readVariable(input, word, next);
		if (variable) return input.acceptToken(variable.term, variable.end);
	}

	// Nothing fits: emit our best guess and let the parser's error recovery
	// deal with it, so the word is still highlighted sensibly.
	if (candidates.length) return input.acceptToken(candidates[0], word.end);
	const variable = readVariable(input, word, next);
	if (variable) return input.acceptToken(variable.term, variable.end);
}

// Is the previous word on this line (ignoring filler) an end-of-block word?
function followsEndOfBlock(input) {
	let off = -1;
	while (isFiller(input.peek(off))) off--;
	let word = "";
	while (isLetter(input.peek(off)) && word.length < 10) word = ch(input.peek(off--)) + word;
	return word.length > 0 && !isIdentChar(input.peek(off)) && isEndOfBlock(word.toLowerCase());
}

function hasIntoLaterOnLine(input, off) {
	for (let w = nextWordOnLine(input, off); w; w = nextWordOnLine(input, w.end)) {
		if (is("into", w.lower)) return true;
	}
	return false;
}

// variable = args / his identifier / pronoun / proper_variable / the identifier / identifier
function readVariable(input, word, next) {
	const lower = word.lower;
	if (lower == "arguments") return { term: T.Arguments, end: word.end };
	if (lower == "the" && next && (next.lower == "world" || next.lower == "outside")) {
		return { term: T.Arguments, end: next.end };
	}
	if (is("his", lower) && next) {
		const after = nextWord(input, next.end);
		if (!isKeyword(next.text, after?.text)) return { term: T.CommonVariable, end: next.end };
	}
	if (is("pronoun", lower)) return { term: T.Pronoun, end: word.end };

	const proper = readProperVariable(input, word, next);
	if (proper) return proper;

	if (is("the", lower) && next) return { term: T.CommonVariable, end: next.end };
	if (!isKeyword(word.text, next?.text)) return { term: T.SimpleVariable, end: word.end };
	return null;
}

// proper_variable = proper_noun (_ proper_noun)+
// proper_noun = uppercase_letter '.' / !keyword &uppercase_letter identifier
function readProperVariable(input, word, next) {
	const properNounEnd = w => {
		if (!w || !isUpper(input.peek(w.start))) return -1;
		if (w.text.length == 1 && input.peek(w.end) == FULL_STOP) return w.end + 1;
		const after = nextWord(input, w.end);
		return isKeyword(w.text, after?.text) ? -1 : w.end;
	};
	let end = properNounEnd(word);
	if (end < 0) return null;
	let count = 1;
	for (let w = nextWord(input, end); ; w = nextWord(input, end)) {
		const e = properNounEnd(w);
		if (e < 0) break;
		end = e;
		count++;
	}
	return count > 1 ? { term: T.ProperVariable, end } : null;
}
