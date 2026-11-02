import { styleTags, tags as t } from "@lezer/highlight"

export const highlighting = styleTags({
	// Variables
	"SimpleVariable CommonVariable ProperVariable": t.variableName,
	Pronoun: t.self,
	Arguments: t.special(t.variableName),
	// "!" stops the variable tokens inside these nodes being styled separately
	"FunctionName!": t.function(t.variableName),
	"FunctionDefinition/FunctionName!": t.function(t.definition(t.variableName)),
	"ParamList/SimpleVariable ParamList/CommonVariable ParamList/ProperVariable ParamList/Pronoun": t.definition(t.variableName),

	// Literals
	Number: t.number,
	String: t.string,
	PoeticString: t.special(t.string),
	"PoeticDigit": t.special(t.number),
	"PoeticDecimal V1Decimal": t.special(t.number),
	"True False": t.bool,
	"Null Mysterious": t.null,
	Empty: t.constant(t.string),

	// Comments and things the engine ignores
	LineComment: t.lineComment,
	BlockComment: t.blockComment,
	Wildcard: t.comment,
	"PoeticNoise Noise": t.punctuation,

	// Punctuation
	"EOS Comma": t.punctuation,
	"ListSep AndSep": t.separator,

	// Operators
	"Plus Minus Times DividedBy \"+\" \"-\" \"*\" \"/\"": t.arithmeticOperator,
	"Is Isnt Exactly Above Under More Less Than As AsGreat AsSmall \"=\" \"!=\" \">=\" \"<=\" \">\" \"<\"": t.compareOperator,
	"And Or Nor Not Non": t.logicOperator,
	At: t.derefOperator,

	// Control flow
	"If Then Else While Until For Every In Of Break Continue Return Back Exit EOB StrayEnd": t.controlKeyword,
	"Takes Taking Call With": t.definitionKeyword,

	// Statements
	"Let Be Put Into Says Holds Now Like Listen To Print Write Debug Dump Push Using Roll Pop Build Up Knock Down Split Cast Join Turn Around": t.keyword,
});
