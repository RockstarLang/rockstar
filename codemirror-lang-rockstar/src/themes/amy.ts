import {tags as t} from '@lezer/highlight';
import createTheme from '../create-theme.js';

// Author: William D. Neumann
export const amy = createTheme({
	variant: 'dark',
	settings: {
		background: '#200020',
		foreground: '#D0D0FF',
		caret: '#7070FF',
		selection: '#80000080',
		gutterBackground: '#200020',
		gutterForeground: '#C080C0',
		lineHighlight: '#80000040',
	},
	styles: [
		{
			tag: t.comment,
			color: '#404080',
		},
		{
			tag: [t.string, t.regexp],
			color: '#999999',
		},
		{
			tag: t.number,
			color: '#7090B0',
		},
		{
			tag: [t.bool, t.null],
			color: '#8080A0',
		},
		{
			tag: [t.punctuation, t.derefOperator],
			color: '#805080',
		},
		{
			tag: t.keyword,
			color: '#60B0FF',
		},
		{
			tag: t.definitionKeyword,
			color: '#B0FFF0',
		},
		{
			tag: t.moduleKeyword,
			color: '#60B0FF',
		},
		{
			tag: t.operator,
			color: '#A0A0FF',
		},
		{
			tag: [t.variableName, t.self],
			color: '#008080',
		},
		{
			tag: t.operatorKeyword,
			color: '#A0A0FF',
		},
		{
			tag: t.controlKeyword,
			color: '#80A0FF',
		},
		{
			tag: t.className,
			color: '#70E080',
		},
		{
			tag: [t.function(t.propertyName), t.propertyName],
			color: '#50A0A0',
		},
		{
			tag: t.tagName,
			color: '#009090',
		},
		{
			tag: t.modifier,
			color: '#B0FFF0',
		},
		{
			tag: [t.squareBracket, t.attributeName],
			color: '#D0D0FF',
		},
	],
});
