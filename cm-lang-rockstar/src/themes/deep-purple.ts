import { tags as t } from '@lezer/highlight';
import createTheme from '../create-theme.js';

// Author: unknown
export const deepPurple = createTheme({
	variant: 'dark',
	settings: {
		background: '#070010',
		foreground: '#ffffff',
		caret: '#6633a9',
		selection: '#6633a9',
		gutterBackground: '#070010',
		gutterForeground: '#6633a9',
		lineHighlight: '#FFFFFF0F',
	},
	styles: [
		{
			tag: t.comment,
			color: '#944af5',
		},
		{
			tag: [t.string, t.special(t.brace), t.regexp],
			color: '#eb1d00',
		},
		{
			tag: [
				t.className,
				t.definition(t.propertyName),
				t.function(t.variableName),
				t.function(t.definition(t.variableName)),
				t.definition(t.typeName),
			],
			color: '#ff9c04',
		},
		{
			tag: [t.number, t.bool, t.null],
			color: '#ff00a8',
		},
		{
			tag: [t.keyword, t.operator],
			color: '#ffcd02',
		},
		{
			tag: [t.definitionKeyword, t.modifier],
			color: '#F8FBB1',
		},
		{
			tag: [t.variableName, t.self],
			color: '#00bcff',
		},
		{
			tag: [t.angleBracket, t.tagName, t.typeName, t.propertyName],
			color: '#ff0ddf',
		},
		{
			tag: t.derefOperator,
			color: '#E0E0E0',
		},
		{
			tag: t.attributeName,
			color: '#1e82c0',
		},
	],
});
