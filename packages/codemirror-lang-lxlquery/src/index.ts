import { parser } from './syntax.grammar';
import { LRLanguage, LanguageSupport, syntaxHighlighting } from '@codemirror/language';
import { styleTags, Tag, tagHighlighter } from '@lezer/highlight';

// custom tags attached to the language parser
const customTags = {
	BooleanQuery: Tag.define('BooleanQuery'),
	Wildcard: Tag.define('Wildcard')
};

export const lxlQueryLanguage = LRLanguage.define({
	name: 'Libris XL query',
	parser: parser.configure({
		props: [styleTags(customTags)]
	}),
	languageData: {}
});

const highlighter = tagHighlighter([
	// adding qualifier classes handled by sypersearch/lxlQualifier plugin
	{ tag: customTags.BooleanQuery, class: 'lxl-boolean-query' },
	{ tag: customTags.Wildcard, class: 'lxl-wildcard' }
]);

const highlighterExtension = syntaxHighlighting(highlighter);

/**
 * Libris XL query language together with a highlighter extension
 * that adds CSS classes for certain nodes
 */
export const lxlQuery = new LanguageSupport(lxlQueryLanguage, highlighterExtension);
