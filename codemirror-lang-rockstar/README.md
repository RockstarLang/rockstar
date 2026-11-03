# @rockstarlang/codemirror-lang-rockstar

[Rockstar](https://codewithrockstar.com) language support for [CodeMirror 6](https://codemirror.net/): a Lezer parser with syntax highlighting, code folding and comment tokens.

## Install

```
npm install @rockstarlang/codemirror-lang-rockstar
```

## Usage

```js
import { EditorView, basicSetup } from "codemirror"
import { rockstar, deepPurple } from "@rockstarlang/codemirror-lang-rockstar"

new EditorView({
  doc: 'Say "hello world"\n',
  extensions: [basicSetup, rockstar(), deepPurple],
  parent: document.body
})
```

### Exports

- `rockstar()`: returns a `LanguageSupport` for Rockstar. Add it to your editor's extensions.
- `rockstarLanguage`: the underlying `LRLanguage`.
- `deepPurple`: the dark theme used on [codewithrockstar.com](https://codewithrockstar.com). It's optional. The parser emits standard `@lezer/highlight` tags, so any CodeMirror theme or `HighlightStyle` will highlight Rockstar code.

### Highlight tags

| Rockstar | Tag |
| --- | --- |
| Variables | `variableName` |
| Pronouns (`it`, `he`, `she`...) | `self` |
| Function names / definitions | `function(variableName)`, `function(definition(variableName))` |
| Function parameters | `definition(variableName)` |
| Numbers / strings | `number`, `string` |
| Poetic literals | `special(number)`, `special(string)` |
| `true` / `false` | `bool` |
| `null`, `mysterious` | `null` |
| `empty`, `silence` | `constant(string)` |
| Comments | `lineComment`, `blockComment` |
| Arithmetic / comparison / logic operators | `arithmeticOperator`, `compareOperator`, `logicOperator` |
| `if`, `while`, `until`, `return`... | `controlKeyword` |
| `takes`, `taking`, `call`, `with` | `definitionKeyword` |
| Other statement keywords | `keyword` |
| List separators (`,`, `and`, `at`) | `separator` |

## Versioning

The package version tracks the Rockstar engine version: `@rockstarlang/codemirror-lang-rockstar@2.0.36` ships the grammar from the same commit as Rockstar `v2.0.36`. It is published automatically by the `publish-codemirror-lang-rockstar` GitHub Action after each engine build.

## Development

```
npm install
npm run build   # generates the Lezer parser, the codewithrockstar.com bundle, and the npm package in dist/
npm test
```

## License

MIT
