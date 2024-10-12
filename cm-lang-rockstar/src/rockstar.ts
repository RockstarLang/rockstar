import { parser } from "./grammars/rockstar.grammar"
import { LRLanguage, LanguageSupport, indentNodeProp, foldNodeProp, foldInside, delimitedIndent } from "@codemirror/language"
import { styleTags, tags as t } from "@lezer/highlight"

export const RockstarLanguage = LRLanguage.define({
	parser: parser.configure({})
	// {
	// 	props: [
	// 		indentNodeProp.add({
	// 			Application: delimitedIndent({ closing: ")", align: false })
	// 		}),
	// 		foldNodeProp.add({
	// 			Application: foldInside
	// 		}),
	// 	]
	// }),
	// languageData: {
	// 	commentTokens: { line: ";" }
	// }
})

export function Rockstar() {
	return new LanguageSupport(RockstarLanguage)
}
