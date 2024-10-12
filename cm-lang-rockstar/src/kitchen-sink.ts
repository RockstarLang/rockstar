import { parser } from "./grammars/kitchen-sink.grammar"
import { LRLanguage, LanguageSupport, indentNodeProp, foldNodeProp, foldInside, delimitedIndent } from "@codemirror/language"
// import { styleTags, tags as t } from "@lezer/highlight"

export const KitchenSinkLanguage = LRLanguage.define({
	parser: parser.configure({
		props: [
			indentNodeProp.add({
				Application: delimitedIndent({ closing: ")", align: false })
			}),
			foldNodeProp.add({
				Application: foldInside
			}),
		]
	}),
	languageData: {
		commentTokens: { line: ";" }
	}
})

export function KitchenSink() {
	return new LanguageSupport(KitchenSinkLanguage)
}
