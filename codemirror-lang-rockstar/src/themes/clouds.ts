import {tags as t} from '@lezer/highlight';
import createTheme from '../create-theme.js';

// Author: Fred LeBlanc
export const clouds = createTheme({
	variant: 'light',
	settings: {
		background: '#fff',
		foreground: '#000',
		caret: '#000',
		selection: '#BDD5FC',
		gutterBackground: '#fff',
		gutterForeground: '#00000070',
		lineHighlight: '#FFFBD1',
	},
	styles: [
		{
			tag: t.comment,
			color: '#BCC8BA',
		},
		{
			tag: [t.string, t.special(t.brace), t.regexp],
			color: '#5D90CD',
		},
		{
			tag: [t.number, t.bool, t.null],
			color: '#46A609',
		},
		{
			tag: t.keyword,
			color: '#AF956F',
		},
		{
			tag: [t.definitionKeyword, t.modifier],
			color: '#C52727',
		},
		{
			tag: [t.angleBracket, t.tagName, t.attributeName],
			color: '#606060',
		},
		{
			tag: t.self,
			color: '#000',
		},
	],
});
