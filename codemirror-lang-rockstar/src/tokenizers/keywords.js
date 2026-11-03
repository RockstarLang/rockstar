// Keyword tables, mirrored from Starship/Rockstar.Engine/rockstar.peg
// (the lowercase rules at the bottom of that file). All matching is
// case-insensitive, as per @ignorecase in the PEG grammar.

export const KW = {
	above: ['above', 'over'],
	and: ['and'],
	arguments: ['arguments'],
	around: ['around', 'round'],
	as: ['as'],
	as_great: ['great', 'high', 'big', 'strong'],
	as_small: ['less', 'low', 'small', 'weak'],
	at: ['at'],
	back: ['back'],
	be: ['be'],
	break: ['break'],
	build: ['build'],
	call: ['call'],
	cast: ['cast', 'burn'],
	continue: ['continue', 'take'],
	debug: ['debug'],
	divided_by: ['between', 'over'], // plus the two-word form "divided by"
	down: ['down'],
	else: ['else', 'otherwise'],
	empty: ['empty', 'silent', 'silence'],
	end: ['end', 'yeah', 'baby', 'oh'],
	every: ['every'],
	exit: ['exit'],
	exactly: ['exactly', 'totally', 'really'],
	false: ['false', 'lies', 'no', 'wrong'],
	for: ['for'],
	his: ['his', 'her'],
	holds: ['hold', 'holds'],
	if: ['if', 'when'],
	in: ['in'],
	into: ['into', 'in'],
	is: ['is', 'was', 'are', 'were', 'am'],
	isnt: ["isnt", "isn't", 'aint', "ain't", "wasn't", "wasnt", "aren't", "arent", "weren't", "werent"],
	join: ['join', 'unite', 'gather'],
	knock: ['knock'],
	less: ['less', 'lower', 'smaller', 'weaker'],
	let: ['let'],
	like: ['like', 'so'],
	listen: ['listen'],
	minus: ['minus', 'without'],
	more: ['greater', 'higher', 'bigger', 'stronger', 'more'],
	mysterious: ['mysterious'],
	non: ['non'],
	nor: ['nor'],
	not: ['not'],
	now: ['now'],
	null: ['null', 'nothing', 'nowhere', 'nobody', 'gone'],
	of: ['of'],
	or: ['or'],
	outside: ['outside'],
	over: ['over'],
	plus: ['plus', 'with'],
	pop: ['pop'],
	print: ['print', 'shout', 'say', 'scream', 'whisper'],
	pronoun: ['they', 'them', 'she', 'him', 'her', 'hir', 'zie', 'zir', 'xem', 'ver', 'ze', 've', 'xe', 'it', 'he', 'you', 'me', 'i'],
	push: ['rock', 'push'],
	put: ['put'],
	return: ['return', 'giving', 'give', 'send'],
	roll: ['roll'],
	says: ['say', 'says', 'said'],
	split: ['cut', 'split', 'shatter'],
	takes: ['takes', 'wants'],
	taking: ['taking'],
	than: ['than'],
	the: ['an', 'a', 'the', 'my', 'your', 'our', 'their'],
	then: ['then'],
	times: ['times', 'of'],
	to: ['to'],
	true: ['true', 'yes', 'ok', 'right'],
	turn: ['turn'],
	under: ['under', 'below'],
	until: ['until'],
	up: ['up'],
	using: ['using', 'with'],
	while: ['while'],
	with: ['with'],
	world: ['world'],
	write: ['write'],
};

// Words that a keyword rule in the PEG grammar matches as a *prefix*, because
// the rule is missing its `!letter` guard (e.g. `less = ... / 'lower' / ...`).
// The engine therefore treats "lowercase" or "biggest" as starting with a
// keyword, so they can never be simple variables. We mirror that behaviour.
const UNGUARDED_PREFIXES = ['lower', 'greater', 'higher', 'bigger'];

const set = (...rules) => new Set(rules.flatMap(r => KW[r]));

// The PEG `keyword` rule: words that can never be a simple variable,
// a proper noun, or follow `his`/`her` in a common variable.
const KEYWORDS = set(
	'plus', 'minus', 'times', 'like', 'and', 'or', 'nor', 'not', 'non',
	'null', 'true', 'false', 'empty', 'mysterious',
	'as', 'as_great', 'as_small', 'at', 'back', 'be', 'build', 'cast', 'down',
	'else', 'end', 'false', 'for', 'holds', 'if', 'into', 'is', 'isnt', 'join',
	'knock', 'less', 'let', 'listen', 'more', 'non', 'not', 'null', 'or', 'over',
	'print', 'pronoun', 'put', 'push', 'return', 'says', 'split', 'takes',
	'taking', 'than', 'the', 'to', 'until', 'up', 'while'
);
KEYWORDS.add('between'); // from divided_by, which can begin an expression

export function isKeyword(word, nextWord) {
	const w = word.toLowerCase();
	if (KEYWORDS.has(w)) return true;
	if (w == 'divided' && nextWord?.toLowerCase() == 'by') return true;
	return UNGUARDED_PREFIXES.some(p => w.startsWith(p));
}

// keywords_which_can_begin_an_expression, plus "now": a v1 poetic number
// (`Tommy was a lean mean wrecking machine`) can't start with one of these.
const EXPRESSION_STARTERS = set(
	'plus', 'minus', 'times', 'like', 'and', 'or', 'nor', 'not', 'non',
	'null', 'true', 'false', 'empty', 'mysterious', 'now', 'divided_by'
);

export function canBeginV1PoeticNumber(word, nextWord) {
	const w = word.toLowerCase();
	if (EXPRESSION_STARTERS.has(w)) return false;
	if (w == 'divided' && nextWord?.toLowerCase() == 'by') return false;
	return true;
}

export const is = (rule, word) => KW[rule].includes(word.toLowerCase());

export const isEndOfBlock = word => is('end', word) || /^o+h$/i.test(word);
