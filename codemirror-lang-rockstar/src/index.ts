// Public entry point for the @rockstarlang/codemirror-lang-rockstar npm package.
import { RockstarLanguage, Rockstar } from "./rockstar"

export { deepPurple } from "./themes/deep-purple"

/** The Rockstar LRLanguage, for use with language-aware CodeMirror extensions. */
export const rockstarLanguage = RockstarLanguage

/** Rockstar language support (parser, highlighting, folding, comment tokens). */
export function rockstar() {
	return Rockstar()
}
