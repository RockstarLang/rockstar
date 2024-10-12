import {tags as t} from '@lezer/highlight';
import createTheme from '../create-theme';

// Author: Zeno Rocha
export const dracula = createTheme({
	variant: 'dark',
	settings: {
		background: '#2d2f3f',
		foreground: '#f8f8f2',
		caret: '#f8f8f0',
		selection: '#44475a',
		gutterBackground: '#282a36',
		gutterForeground: 'rgb(144, 145, 148)',
		lineHighlight: '#44475a',
	},
	styles: [
		{
			tag: t.comment,
			color: '#6272a4',
		},
		{
			tag: [t.string, t.special(t.brace)],
			color: '#f1fa8c',
		},
		{
			tag: [t.number, t.self, t.bool, t.null],
			color: '#bd93f9',
		},
		{
			tag: [t.keyword, t.operator],
			color: '#ff79c6',
		},
		{
			tag: [t.definitionKeyword, t.typeName],
			color: '#8be9fd',
		},
		{
			tag: t.definition(t.typeName),
			color: '#f8f8f2',
		},
		{
			tag: [
				t.className,
				t.definition(t.propertyName),
				t.function(t.variableName),
				t.attributeName,
			],
			color: '#50fa7b',
		},
	],
});