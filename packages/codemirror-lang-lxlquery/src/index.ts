import { parser } from './syntax.grammar';
import { LRLanguage, LanguageSupport, syntaxHighlighting } from '@codemirror/language';
import { styleTags, Tag, tagHighlighter } from '@lezer/highlight';

/**
 * Custom tags attached to the language parser
 * see https://lezer.codemirror.net/docs/ref/#highlight.styleTags
 * for the matching syntax
 */
const tags = {
	BooleanQuery: Tag.define('BooleanQuery'),
	Wildcard: Tag.define('Wildcard'),
	Qualifier: Tag.define('Qualifier'),
	QualifierKey: Tag.define('QualifierKey'),
	QualifierOperator: Tag.define('QualifierOperator'),
	QualifierValue: Tag.define('QualifierValue')
};

const tagMatcher = {
	BooleanQuery: tags.BooleanQuery,
	Wildcard: tags.Wildcard,
	'Qualifier/...': tags.Qualifier,
	'QualifierKey/...': tags.QualifierKey,
	'QualifierOperator/...': tags.QualifierOperator,
	'QualifierValue/...': tags.QualifierValue
};

export const lxlQueryLanguage = LRLanguage.define({
	name: 'Libris XL query',
	parser: parser.configure({
		props: [styleTags(tagMatcher)]
	}),
	languageData: {}
});

const highlighter = tagHighlighter([
	{ tag: tags.BooleanQuery, class: 'lxl-boolean-query' },
	{ tag: tags.Wildcard, class: 'lxl-wildcard' },
	{ tag: tags.Qualifier, class: 'lxl-qualifier' },
	{ tag: tags.QualifierKey, class: 'lxl-qualifier-key' },
	{ tag: tags.QualifierOperator, class: 'lxl-qualifier-operator' },
	{ tag: tags.QualifierValue, class: 'lxl-qualifier-value' }
]);

const highlighterExtension = syntaxHighlighting(highlighter);

/**
 * Libris XL query language together with a highlighter extension
 * that adds CSS classes for certain nodes
 */
export const lxlQuery = new LanguageSupport(lxlQueryLanguage, highlighterExtension);
