import { parser } from "./grammars/rockstar.grammar"
import { LRLanguage, LanguageSupport, foldNodeProp } from "@codemirror/language"
import type { SyntaxNode } from "@lezer/common"

// Fold a block from the end of the line that opens it (the If, While,
// function definition, etc.) to the end of its last statement, leaving
// the "yeah" / "end" / blank line that closes it visible.
function foldBlock(block: SyntaxNode) {
	let last: SyntaxNode | null = block.lastChild;
	while (last && ["EOS", "EOB", "Noise", "StrayEnd", "LineComment", "BlockComment"].includes(last.name)) last = last.prevSibling;
	if (!last || last.to <= block.from) return null;
	return { from: block.from, to: last.to };
}

export const RockstarLanguage = LRLanguage.define({
	name: "rockstar",
	parser: parser.configure({
		props: [
			foldNodeProp.add({ Block: foldBlock })
		]
	}),
	languageData: {
		commentTokens: { line: "#", block: { open: "(", close: ")" } }
	}
})

export function Rockstar() {
	return new LanguageSupport(RockstarLanguage)
}
