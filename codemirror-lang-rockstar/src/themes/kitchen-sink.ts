import { tags as t } from '@lezer/highlight';
import createTheme from '../create-theme';
export const kitchenSink = createTheme({
	variant: 'dark',
	settings: {
		background: '#000000',
		foreground: '#ffffff',
		caret: '#ff00ff',
		selection: '#0000ff',
		gutterBackground: '#006666',
		gutterForeground: 'rgb(50, 90, 150)',
		lineHighlight: '#111111',
	},
	styles: makeStyles()
});

function makeStyles() {
	// Every tag listed at https://lezer.codemirror.net/docs/ref/#highlight.tags
	var tags = [t.comment, t.lineComment, t.blockComment, t.docComment, t.name, t.variableName, t.typeName, t.tagName, t.propertyName,
	t.attributeName, t.className, t.labelName, t.namespace, t.macroName, t.literal, t.string, t.docString, t.character, t.attributeValue,
	t.number, t.integer, t.float, t.bool, t.regexp, t.escape, t.color, t.url, t.keyword, t.self, t.null, t.atom, t.unit, t.modifier,
	t.operatorKeyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operator, t.derefOperator, t.arithmeticOperator,
	t.logicOperator, t.bitwiseOperator, t.compareOperator, t.updateOperator, t.definitionOperator, t.typeOperator, t.controlOperator,
	t.punctuation, t.separator, t.bracket, t.angleBracket, t.squareBracket, t.paren, t.brace, t.content, t.heading,
	t.heading1, t.heading2, t.heading3, t.heading4, t.heading5, t.heading6, t.contentSeparator, t.list, t.quote, t.emphasis, t.strong,
	t.link, t.monospace, t.strikethrough, t.inserted, t.deleted, t.changed, t.invalid, t.meta, t.documentMeta, t.annotation, t.processingInstruction,
	t.definition(t.name), t.constant(t.name), t.function(t.name), t.standard(t.name), t.local(t.name), t.special(t.name)
	];
	var result = [];
	for (var i = 0; i < tags.length; i++) {
		result.push({ tag: tags[i], color: `hsl(${i * 19} 100 50)`});
	}
	return result;
}
