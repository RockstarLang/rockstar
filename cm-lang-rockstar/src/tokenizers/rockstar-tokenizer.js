import { ExternalTokenizer } from "@lezer/lr"
import { tokenize } from "./rockstar-lexer.js"

// contextual: the tokens we produce depend on the parse state, so they can't
// be cached by position and reused across different parse stacks.
export const rockstarTokens = new ExternalTokenizer(tokenize, { contextual: true });
