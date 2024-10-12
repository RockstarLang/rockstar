import * as tokens from "../grammars/rockstar.terms.js"
import { ASCII } from './ascii.js';
import { aliases, keywords } from "./keywords.js";

const compareOperators = [">=", "<=", ">", "<", "="];
const arithmeticOperators = ["+", "/", "*", "-"];

const noise = " \t,?!./;";
const noiseCodes = stringToCharCodeArray(noise);

const endOfStatementMarkers = "?!.;";
const endOfStatementCodes = stringToCharCodeArray(endOfStatementMarkers);

export function tokenizeEOB(input) {
	var skipCodes = spaceCodes.concat(noiseCodes);
	while (input.next >= 0 && skipCodes.includes(input.next)) input.advance();
	var i = 0;
	if (input.peek(i) == ASCII.CR) i++;
	if (input.peek(i) == ASCII.LF) {
		input.advance(i + 1); // eat the newline.
		i = 0;
		if (input.next < 0) return;
		while (input.peek(i) >= 0) {
			while (noiseCodes.includes(input.peek(i))) i++;
			if (input.peek(i) == ASCII.CR) i++;
			if (input.peek(i) == ASCII.LF) return input.acceptToken(tokens.EOB);
			while (noiseCodes.includes(input.peek(i))) i++;
			let [codes, _] = peekNextWord(input, i);
			var lexeme = String.fromCodePoint(...codes).toLowerCase();
			if (aliases.get(tokens.Else).includes(lexeme)) return input.acceptToken(tokens.EOB);
			if (aliases.get(tokens.End).includes(lexeme)) return input.acceptToken(tokens.EOB);
			i++;
		}
	}
	var [codes, _] = peekNextWord(input);
	var lexeme = String.fromCodePoint(...codes);
	if (/oo*h/i.test(lexeme)) {
		input.advance(1);
		return input.acceptToken(tokens.EOB);
	}
	if (aliases.get(tokens.Else).includes(lexeme) || aliases.get(tokens.End).includes(lexeme)) {
		readNextWord(input);
		return input.acceptToken(tokens.EOB);
	}
}

let endOfWildcardCodes = endOfStatementCodes.concat([ASCII.CR, ASCII.LF]);

export function tokenizeWildcard(input) {
	while (input.next >= 0) {
		if (endOfWildcardCodes.includes(input.peek())) {
			if (input.peek() == ASCII.CR) input.advance();
			return input.acceptToken(tokens.Wildcard);
		}
		input.advance();
	}
}

export function tokenizeEOS(input) {
	var foundEOS = false;
	var skipCodes = spaceCodes.concat(noiseCodes);
	while (input.next >= 0 && skipCodes.includes(input.next)) {
		if (endOfStatementCodes.includes(input.next)) foundEOS = true;
		input.advance();
	}
	var i = 0;
	if (input.peek(i) == ASCII.CR) i++;
	if (input.peek(i) == ASCII.LF) {
		input.advance(i + 1); // eat the newline.
		foundEOS = true;
	}
	var [codes, _] = peekUntilNextWhitespace(input);
	if (codes.length) {
		var lexeme = String.fromCodePoint(...codes).toLowerCase();
		if (aliases.get(tokens.And).includes(lexeme)) return;
		if (["&", "n'", "'n'"].includes(lexeme)) return;
	}
	if (foundEOS) return input.acceptToken(tokens.EOS);
}

// export function tokenizeEndMarkers(input) {
// 	var foundEOS = false;
// 	var skipCodes = spaceCodes.concat(noiseCodes);
// 	while (input.next >= 0 && skipCodes.includes(input.next)) {
// 		if (endOfStatementCodes.includes(input.next)) foundEOS = true;
// 		input.advance();
// 	}
// 	var i = 0;
// 	if (input.peek(i) == ASCII.CR) i++;
// 	if (input.peek(i) == ASCII.LF) {
// 		input.advance(i + 1); // eat the newline.
// 		i = 0;
// 		if (input.next < 0) return input.acceptToken(tokens.EOS);
// 		while (input.peek(i) >= 0) {
// 			while (noiseCodes.includes(input.peek(i))) i++;
// 			if (input.peek(i) == ASCII.CR) i++;
// 			if (input.peek(i) == ASCII.LF) return input.acceptToken(tokens.EOB);
// 			while (noiseCodes.includes(input.peek(i))) i++;
// 			let [codes, _] = peekNextWord(input, i);
// 			var lexeme = String.fromCodePoint(...codes).toLowerCase();
// 			if (aliases.get(tokens.Else).includes(lexeme)) return input.acceptToken(tokens.EOB);
// 			if (aliases.get(tokens.End).includes(lexeme)) return input.acceptToken(tokens.EOB);
// 			i++;
// 		}
// 	}
// 	var offset = input.pos;
// 	var [codes, index] = peekNextWord(input);
// 	var lexeme = String.fromCodePoint(...codes);
// 	if (/oo*h/i.test(lexeme)) {
// 		input.advance(1);
// 		return input.acceptToken(tokens.EOB);
// 	}
// 	if (aliases.get(tokens.Else).includes(lexeme || aliases.get(tokens.End).includes(lexeme))) {
// 		readNextWord(input);
// 		return input.acceptToken(tokens.EOB);
// 	}
// 	if (aliases.get(tokens.And).includes(codes)) return; // Do not treat the ", and" Oxford comma as an EOS
// 	if (foundEOS) return input.acceptToken(tokens.EOS);
// }

export function tokenizePoeticNumber(input) {
	let codes = [];
	while (spaceCodes.includes(input.next)) input.advance();
	// poetic numbers always start with a letter
	if (!(alphaCodes.concat([ASCII.Apostrophe, ASCII.Hyphen]).includes(input.next))) return;
	while (input.next >= 0 && !spaceCodes.includes(input.next)) {
		codes.push(input.next);
		input.advance();
	}
	let lexeme = String.fromCodePoint(...codes).toLowerCase();
	if (isArithmeticOperator(lexeme)) return;
	while (input.next >= 0 && input.next != ASCII.LF) input.advance();
	return input.acceptToken(tokens.PoeticNumber);
}

export function tokenizePoeticString(input) {
	while (input.next >= 0 && input.next != ASCII.LF) input.advance();
	input.acceptToken(tokens.PoeticString);
}

function isArithmeticOperator(lexeme) {
	if (compareOperators.includes(lexeme)) return true;
	if (arithmeticOperators.includes(lexeme)) return true;
	for (var op of operatorMaps.keys()) {
		for (var token of operatorMaps.get(op)) {
			if (aliases.get(token).includes(lexeme)) return true;
		}
	}
	return false;
}

export function tokenizeOperator(input) {
	var codes = readNextWordIncludingOperators(input);
	var lexeme = String.fromCodePoint(...codes).toLowerCase();
	if (compareOperators.includes(lexeme)) return input.acceptToken(tokens.CompareOperator);
	if (arithmeticOperators.includes(lexeme)) return input.acceptToken(tokens.ArithmeticOperator);
	if (aliases.get(tokens.Is).includes(lexeme)) {
		codes = readNextWordIncludingOperators(input);
		lexeme = String.fromCodePoint(...codes).toLowerCase();
		for (var token of [tokens.Above, tokens.Less, tokens.More, tokens.Under]) {
			if (aliases.get(token).includes(lexeme)) {
				var tokenTo = input.pos;
				codes = readNextWordIncludingOperators(input);
				lexeme = String.fromCodePoint(...codes).toLowerCase();
				if (aliases.get(tokens.Than).includes(lexeme)) {
					return input.acceptToken(tokens.CompareOperator);
				} else {
					return input.acceptTokenTo(tokens.CompareOperator, tokenTo);
				}
			}
		}
		if (lexeme == "as") {
			codes = readNextWordIncludingOperators(input);
			lexeme = String.fromCodePoint(...codes).toLowerCase();
			for (var token of [tokens.Great, tokens.Small]) {
				if (aliases.get(token).includes(lexeme)) {
					codes = readNextWordIncludingOperators(input);
					lexeme = String.fromCodePoint(...codes).toLowerCase();
					if (aliases.get(tokens.As).includes(lexeme)) return input.acceptToken(tokens.CompareOperator);
				}
			}
		}
	} else {
		for (var op of operatorMaps.keys()) {
			for (var token of operatorMaps.get(op)) {
				if (aliases.get(token).includes(lexeme)) {
					if (lexeme == "divided") {
						var [codes, index] = peekNextWord(input);
						if (String.fromCodePoint(...codes).toLowerCase() == "by") readNextWord(input);
					}
					return input.acceptToken(op);
				}
			}
		}
	}
}

const operatorMaps = new Map();
operatorMaps.set(tokens.CompareOperator, [tokens.Not, tokens.Is, tokens.Isnt]);
operatorMaps.set(tokens.ArithmeticOperator, [tokens.Plus, tokens.Minus, tokens.Divided, tokens.Times]);
operatorMaps.set(tokens.LogicOperator, [tokens.And, tokens.Nor, tokens.Or]);

export function tokenizeKeyword(input) {
	var codes = readNextWord(input);
	var lexeme = String.fromCodePoint(...codes).toLowerCase();
	for (const [key, value] of aliases) {
		if (value.includes(lexeme)) return input.acceptToken(key);
	}
}

const MAXIMUM_PARTS_IN_A_PROPER_VARIABLE = 99;

export function tokenizeVariable(input) {
	var codes = readNextWord(input);
	if (!codes.length) return;
	var lexeme = String.fromCodePoint(...codes);

	if (aliases.get(tokens.The).includes(lexeme.toLowerCase())) {
		readNextWord(input);
		return input.acceptToken(tokens.CommonVariable);
	}

	if (aliases.get(tokens.His).includes(lexeme.toLowerCase())) {
		codes = readNextWord(input);
		lexeme += " " + String.fromCodePoint(...codes);
		if (codes.length == 0 || isKeyword(codes)) return input.acceptToken(tokens.Pronoun);
		return input.acceptToken(tokens.CommonVariable);
	}

	if (aliases.get(tokens.Pronoun).includes(lexeme.toLowerCase())) return input.acceptToken(tokens.Pronoun);
	if (isKeyword(codes)) return;

	while (input.next == ASCII.FullStop) {
		codes.push(input.next);
		input.advance();
	}
	var properNouns = [];
	var index = 0;
	var tokenTo = input.pos;

	for (var i = 0; i < MAXIMUM_PARTS_IN_A_PROPER_VARIABLE; i++) {
		if (isKeyword(codes)) break;
		if (upperCodes.includes(codes[0])) {
			properNouns.push(String.fromCodePoint(...codes));
			input.advance(index);
			tokenTo += index;
		}
		[codes, index] = peekNextWord(input);
	}
	if (properNouns.length > 1) return input.acceptTokenTo(tokens.ProperVariable, tokenTo);
	return input.acceptToken(tokens.SimpleVariable);
}

function isKeyword(codes) {
	var lexeme = (typeof (codes) == "string" ? codes.toLowerCase() : (String.fromCodePoint(...codes).toLowerCase()));
	return keywords.includes(lexeme);
}

const space = " \t";
const spaceCodes = stringToCharCodeArray(space);

const readNextWordIncludingOperators = (input) => readWhileContains(input, alphaCodes.concat(opCodes));
const readNextWordIncludingApostrophes = (input) => readWhileContains(input, [ASCII.Apostrophe].concat(alphaCodes));

const readNextWord = (input) => readWhileContains(input, alphaCodes);

const peekUntilNextWhitespace = (input, index = 0) => {
	let codes = [];
	while (spaceCodes.includes(input.peek(index))) index++;
	while (true) {
		var code = input.peek(index);
		if (code <= 0) break;
		if (spaceCodes.includes(code)) break;
		codes.push(code);
		index++;
	}
	return [codes, index];
}

const peekNextWord = (input, index = 0) => {
	let codes = [];
	while (spaceCodes.includes(input.peek(index))) index++;
	if (input.peek(index) <= 0) return [codes, index];
	while (alphaCodes.includes(input.peek(index))) codes.push(input.peek(index++));
	while (input.peek(index) == ASCII.FullStop) codes.push(input.peek(index++));
	return [codes, index];
}

function readWhileContains(input, accept) {
	let codes = [];
	while (spaceCodes.includes(input.next)) input.advance();
	while (accept.includes(input.next)) {
		codes.push(input.next);
		input.advance();
	}
	return codes;
}

function stringToCharCodeArray(s) {
	var result = [];
	for (var i = 0; i < s.length; i++) result.push(s.charCodeAt(i));
	return result;
}

const operators = "'<>=!+/-*";
const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞĀĂĄĆĈĊČĎĐĒĔĖĘĚĜĞĠĢĤĦĨĪĬĮİĲĴĶĸĹĻĽĿŁŃŅŇŊŌŎŐŒŔŖŘŚŜŞŠŢŤŦŨŪŬŮŰŲŴŶŸŹŻŽ";
const lowers = "abcdefghijklmnopqrstuvwxyzàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþāăąćĉċčďđēĕėęěĝğġģĥħĩīĭįi̇ĳĵķĸĺļľŀłńņňŋōŏőœŕŗřśŝşšţťŧũūŭůűųŵŷÿźżžŉß";
const opCodes = stringToCharCodeArray(operators);
const upperCodes = stringToCharCodeArray(uppers);
const lowerCodes = stringToCharCodeArray(lowers);
const alphaCodes = upperCodes.concat(lowerCodes);

