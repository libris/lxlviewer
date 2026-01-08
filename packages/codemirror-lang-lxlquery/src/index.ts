import { parser } from './syntax.grammar';
import { LRLanguage, LanguageSupport } from '@codemirror/language';
import lxlLinter from './lxlLinter';
import lxlHighlight from './lxlHighlight';

export const lxlQueryLanguage = LRLanguage.define({
	name: 'Libris XL query',
	parser: parser.configure({
		props: []
	})
});

const extensions = [lxlLinter, lxlHighlight];

/**
 * Libris XL query language together with highlighter extensions
 * that adds CSS classes for certain nodes
 */
export const lxlQuery = new LanguageSupport(lxlQueryLanguage, extensions);
