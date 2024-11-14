import { syntaxHighlighting } from '@codemirror/language';
import { customTags as t } from 'codemirror-lang-lxlquery';
import { tagHighlighter } from '@lezer/highlight';

const highlighter = tagHighlighter([
  { tag: t.Qualifier, class: 'qualifier' },
  { tag: t.QualifierKey, class: 'qualifier-key' },
  { tag: t.QualifierValue, class: 'qualifier-value' },
  { tag: t.EqualOperator, class: 'equal-operator' },
  { tag: t.CompareOperator, class: 'compare-operator' },
  { tag: t.BooleanOperator, class: 'boolean-operator' },
  { tag: t.BooleanQuery, class: 'boolean-query' },
  { tag: t.Wildcard, class: 'wildcard' }
], {
  all: 'lxlq',
})

export const highlightExtension = syntaxHighlighting(highlighter);