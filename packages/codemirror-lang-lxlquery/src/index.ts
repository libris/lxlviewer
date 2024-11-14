import { parser } from './syntax.grammar';
import { LRLanguage, LanguageSupport, syntaxHighlighting } from '@codemirror/language';
import { styleTags, Tag, tagHighlighter } from '@lezer/highlight';

// custom tags that is attached to the language parser
const customTags = {
	Qualifier: Tag.define('Qualifier'),
	QualifierKey: Tag.define('QualifierKey'),
	QualifierValue: Tag.define('QualifierValue'),
	EqualOperator: Tag.define('EqualOperator'),
	CompareOperator: Tag.define('CompareOperator'),
	BooleanQuery: Tag.define('BooleanQuery'),
	BooleanOperator: Tag.define('BooleanOperator'),
	Wildcard: Tag.define('Wildcard')
};

export const lxlQueryLanguage = LRLanguage.define({
	name: 'Libris XL query',
	parser: parser.configure({
		props: [styleTags(customTags)]
	}),
	languageData: {}
});

export function lxlQuery() {
	return new LanguageSupport(lxlQueryLanguage);
}

const highlighter = tagHighlighter(
	[
		{ tag: customTags.Qualifier, class: 'qualifier' },
		{ tag: customTags.QualifierKey, class: 'qualifier-key' },
		{ tag: customTags.QualifierValue, class: 'qualifier-value' },
		{ tag: customTags.EqualOperator, class: 'equal-operator' },
		{ tag: customTags.CompareOperator, class: 'compare-operator' },
		{ tag: customTags.BooleanOperator, class: 'boolean-operator' },
		{ tag: customTags.BooleanQuery, class: 'boolean-query' },
		{ tag: customTags.Wildcard, class: 'wildcard' }
	],
	{
		all: 'lxlq'
	}
);

/**
 * CM editor extension that adds CSS classes for lxlquery nodes
 */
export const highlighterExtension = syntaxHighlighting(highlighter);
