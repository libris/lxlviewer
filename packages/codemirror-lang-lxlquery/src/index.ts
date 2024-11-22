import { parser } from './syntax.grammar';
import { LRLanguage, LanguageSupport, syntaxHighlighting } from '@codemirror/language';
import { styleTags, Tag, tagHighlighter } from '@lezer/highlight';

// custom tags attached to the language parser
const customTags = {
	Qualifier: Tag.define('Qualifier'),
	QualifierKey: Tag.define('QualifierKey'),
	QualifierValue: Tag.define('QualifierValue'),
	QualifierOperator: Tag.define('QualifierOperator'),
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

const highlighter = tagHighlighter(
	[
		{ tag: customTags.Qualifier, class: 'qualifier' },
		{ tag: customTags.QualifierKey, class: 'qualifier-key' },
		{ tag: customTags.QualifierValue, class: 'qualifier-value' },
		{ tag: customTags.QualifierOperator, class: 'qualifier-operator' },
		{ tag: customTags.BooleanQuery, class: 'boolean-query' },
		{ tag: customTags.Wildcard, class: 'wildcard' }
	],
	{
		all: 'lxlq'
	}
);

const highlighterExtension = syntaxHighlighting(highlighter);

/**
 * Libris XL query language together with a highlighter extension 
 * that adds CSS classes for certain nodes
 */
export const lxlQuery = new LanguageSupport(lxlQueryLanguage, highlighterExtension)
