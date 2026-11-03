import {tags as t} from '@lezer/highlight';
import createTheme from '../create-theme.js';

// Author: unknown
export const coolGlow = createTheme({
	variant: 'dark',
	settings: {
		background: '#060521',
		foreground: '#E0E0E0',
		caret: '#FFFFFFA6',
		selection: '#122BBB',
		gutterBackground: '#060521',
		gutterForeground: '#E0E0E090',
		lineHighlight: '#FFFFFF0F',
	},
	styles: [
		{
			tag: t.comment,
			color: '#AEAEAE',
		},
		{
			tag: [t.string, t.special(t.brace), t.regexp],
			color: '#8DFF8E',
		},
		{
			tag: [
				t.className,
				t.definition(t.propertyName),
				t.function(t.variableName),
				t.function(t.definition(t.variableName)),
				t.definition(t.typeName),
			],
			color: '#A3EBFF',
		},
		{
			tag: [t.number, t.bool, t.null],
			color: '#62E9BD',
		},
		{
			tag: [t.keyword, t.operator],
			color: '#2BF1DC',
		},
		{
			tag: [t.definitionKeyword, t.modifier],
			color: '#F8FBB1',
		},
		{
			tag: [t.variableName, t.self],
			color: '#B683CA',
		},
		{
			tag: [t.angleBracket, t.tagName, t.typeName, t.propertyName],
			color: '#60A4F1',
		},
		{
			tag: t.derefOperator,
			color: '#E0E0E0',
		},
		{
			tag: t.attributeName,
			color: '#7BACCA',
		},
	],
});
