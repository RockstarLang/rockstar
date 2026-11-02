import { tags as t } from '@lezer/highlight';
import createTheme from '../create-theme.js';

// Author: unknown
export const deepPurple = createTheme({
	variant: 'dark',
	settings: {
		background: '#070010',
		foreground: '#ffffff',
		caret: '#ffffff',
		selection: '#6633a9',
		gutterBackground: '#070010',
		gutterForeground: '#6633a9',
		lineHighlight: '#FFFFFF0F',
	},
	styles: [
		// Comments
		{
			tag: t.comment,
			color: '#944af5',
			fontStyle: 'italic',
		},
		// Strings; poetic strings are italic and a lighter shade
		{
			tag: [t.string, t.special(t.brace), t.regexp],
			color: '#eb1d00',
		},
		{
			tag: t.special(t.string),
			color: '#ff7b5c',
			fontStyle: 'italic',
		},
		// Functions
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
		// Numbers and constants; poetic numbers are italic and a lighter shade
		{
			tag: [t.number, t.bool, t.null],
			color: '#ff00a8',
		},
		{
			tag: t.special(t.number),
			color: '#ff7ad9',
			fontStyle: 'italic',
		},
		// Keywords
		{
			tag: t.keyword,
			color: '#ffcd02',
		},
		{
			tag: t.controlKeyword,
			color: '#00e5a0',
			fontWeight: 'bold',
		},
		{
			tag: [t.definitionKeyword, t.modifier],
			color: '#F8FBB1',
			fontStyle: 'italic',
		},
		// Operators
		{
			tag: [t.operator, t.arithmeticOperator, t.compareOperator, t.logicOperator],
			color: '#c9a0ff',
		},
		{
			tag: t.derefOperator,
			color: '#E0E0E0',
		},
		// Variables: parameters are bold, pronouns are italic
		{
			tag: t.variableName,
			color: '#00bcff',
		},
		{
			tag: t.definition(t.variableName),
			color: '#00bcff',
			fontWeight: 'bold',
		},
		{
			tag: t.self,
			color: '#66d9ff',
			fontStyle: 'italic',
		},
		// Punctuation, separators and ignored words are dimmed
		{
			tag: t.punctuation,
			color: '#7a5aa8',
		},
		{
			tag: t.separator,
			color: '#b08cd9',
		},
		{
			tag: [t.angleBracket, t.tagName, t.typeName, t.propertyName],
			color: '#ff0ddf',
		},
		{
			tag: t.attributeName,
			color: '#1e82c0',
		},
	],
});
