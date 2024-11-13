import { parser } from './syntax.grammar';
import { LRLanguage, LanguageSupport } from '@codemirror/language';
import { styleTags, Tag } from '@lezer/highlight';

// Turn these grammar nodes into stylable tags
export const customTags = {
	Qualifier: Tag.define('Qualifier'),
	QualifierKey: Tag.define('QualifierKey'),
	QualifierValue: Tag.define('QualifierValue'),
	EqualOperator: Tag.define('EqualOperator'),
	CompareOperator: Tag.define('CompareOperator'),
	BooleanQuery: Tag.define('BooleanQuery'),
	BooleanOperator: Tag.define('BooleanOperator'),
	Wildcard: Tag.define('Wildcard')
}

export const lxlQueryLanguage = LRLanguage.define({
	name: 'Libris XL query',
	parser: parser.configure({
		props: [
			styleTags(customTags)
		]
	}),
	languageData: {}
});

export function lxlQuery() {
	return new LanguageSupport(lxlQueryLanguage);
}
