import { syntaxHighlighting } from '@codemirror/language';
import { customTags as t } from 'codemirror-lang-lxlquery';
import { tagHighlighter } from '@lezer/highlight';

const highlighter = tagHighlighter([
  { tag: t.Qualifier, class: 'qualifier' },
  { tag: t.QualifierKey, class: 'qualifierkey' },
  { tag: t.QualifierValue, class: 'qualifiervalue' },
  { tag: t.EqualOperator, class: 'equaloperator' },
  { tag: t.CompareOperator, class: 'compareoperator' },
  { tag: t.BooleanOperator, class: 'booleanoperator' },
  { tag: t.BooleanQuery, class: 'booleanquery' },
  { tag: t.Wildcard, class: 'wildcard' }
], {
  all: 'lxlq',
})

export const highlightExtension = syntaxHighlighting(highlighter);