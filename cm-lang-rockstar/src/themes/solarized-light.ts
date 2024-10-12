import {tags as t} from '@lezer/highlight';
import createTheme from '../create-theme';

// Author: Ethan Schoonover
export const solarizedLight = createTheme({
	variant: 'light',
	settings: {
		background: '#fef7e5',
		foreground: '#586E75',
		caret: '#000000',
		selection: '#073642',
		gutterBackground: '#fef7e5',
		gutterForeground: '#586E7580',
		lineHighlight: '#EEE8D5',
	},
	styles: [
		{
			tag: t.comment,
			color: '#93A1A1',
		},
		{
			tag: t.string,
			color: '#2AA198',
		},
		{
			tag: t.regexp,
			color: '#D30102',
		},
		{
			tag: t.number,
			color: '#D33682',
		},
		{
			tag: t.variableName,
			color: '#268BD2',
		},
		{
			tag: [t.keyword, t.operator, t.punctuation],
			color: '#859900',
		},
		{
			tag: [t.definitionKeyword, t.modifier],
			color: '#073642',
			fontWeight: 'bold',
		},
		{
			tag: [t.className, t.self, t.definition(t.propertyName)],
			color: '#268BD2',
		},
		{
			tag: t.function(t.variableName),
			color: '#268BD2',
		},
		{
			tag: [t.bool, t.null],
			color: '#B58900',
		},
		{
			tag: t.tagName,
			color: '#268BD2',
			fontWeight: 'bold',
		},
		{
			tag: t.angleBracket,
			color: '#93A1A1',
		},
		{
			tag: t.attributeName,
			color: '#93A1A1',
		},
		{
			tag: t.typeName,
			color: '#859900',
		},
	],
});
