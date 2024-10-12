import {tags as t} from '@lezer/highlight';
import createTheme from '../create-theme';

// Author: Jacob Rus
export const cobalt = createTheme({
	variant: 'dark',
	settings: {
		background: '#00254b',
		foreground: '#FFFFFF',
		caret: '#FFFFFF',
		selection: '#B36539BF',
		gutterBackground: '#00254b',
		gutterForeground: '#FFFFFF70',
		lineHighlight: '#00000059',
	},
	styles: [
		{
			tag: t.comment,
			color: '#0088FF',
		},
		{
			tag: t.string,
			color: '#3AD900',
		},
		{
			tag: t.regexp,
			color: '#80FFC2',
		},
		{
			tag: [t.number, t.bool, t.null],
			color: '#FF628C',
		},
		{
			tag: [t.definitionKeyword, t.modifier],
			color: '#FFEE80',
		},
		{
			tag: t.variableName,
			color: '#CCCCCC',
		},
		{
			tag: t.self,
			color: '#FF80E1',
		},
		{
			tag: [
				t.className,
				t.definition(t.propertyName),
				t.function(t.variableName),
				t.definition(t.typeName),
				t.labelName,
			],
			color: '#FFDD00',
		},
		{
			tag: [t.keyword, t.operator],
			color: '#FF9D00',
		},
		{
			tag: [t.propertyName, t.typeName],
			color: '#80FFBB',
		},
		{
			tag: t.special(t.brace),
			color: '#EDEF7D',
		},
		{
			tag: t.attributeName,
			color: '#9EFFFF',
		},
		{
			tag: t.derefOperator,
			color: '#fff',
		},
	],
});
