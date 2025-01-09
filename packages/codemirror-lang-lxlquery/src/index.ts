import { parser } from './syntax.grammar';
import { LRLanguage, LanguageSupport, syntaxHighlighting } from '@codemirror/language';
import { styleTags, Tag, tagHighlighter } from '@lezer/highlight';
import lxlLinter from './lxlLinter';

/**
 * Custom tags attached to the language parser
 * see https://lezer.codemirror.net/docs/ref/#highlight.styleTags
 * for the matching syntax
 */
const tags = {
	BooleanOperator: Tag.define('BooleanOperator'),
	Wildcard: Tag.define('Wildcard'),
	Qualifier: Tag.define('Qualifier'),
	QualifierKey: Tag.define('QualifierKey'),
	QualifierOperator: Tag.define('QualifierOperator'),
	QualifierValue: Tag.define('QualifierValue')
};

const tagMatcher = {
	'NotOperator BooleanQuery/BooleanOperator': tags.BooleanOperator, // only highlight operator within valid query
	'Query/Wildcard': tags.Wildcard,
	'Qualifier/...': tags.Qualifier,
	'QualifierKey!': tags.QualifierKey,
	'QualifierOperator!': tags.QualifierOperator,
	'QualifierValue!': tags.QualifierValue
};

export const lxlQueryLanguage = LRLanguage.define({
	name: 'Libris XL query',
	parser: parser.configure({
		props: [styleTags(tagMatcher)]
	}),
	languageData: {}
});

const highlighter = tagHighlighter([
	{ tag: tags.BooleanOperator, class: 'lxl-boolean-operator' },
	{ tag: tags.Wildcard, class: 'lxl-wildcard' },
	{ tag: tags.Qualifier, class: 'lxl-qualifier' },
	{ tag: tags.QualifierKey, class: 'lxl-qualifier-key' },
	{ tag: tags.QualifierOperator, class: 'lxl-qualifier-operator' },
	{ tag: tags.QualifierValue, class: 'lxl-qualifier-value' }
]);

const highlighterExtensions = [syntaxHighlighting(highlighter), lxlLinter];

/**
 * Libris XL query language together with highlighter extensions
 * that adds CSS classes for certain nodes
 */
export const lxlQuery = new LanguageSupport(lxlQueryLanguage, highlighterExtensions);
