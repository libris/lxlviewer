import {parser} from "./syntax.grammar"
import {LRLanguage, LanguageSupport, foldNodeProp, foldInside } from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"

export const lxlQueryLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      foldNodeProp.add({
        Application: foldInside
      }),
      styleTags({
        Identifier: t.variableName,
        String: t.string,
        CompareOperator: t.compareOperator,
        "( )": t.paren
      })
    ]
  }),
  languageData: {}
})

export function lxlQuery() {
  return new LanguageSupport(lxlQueryLanguage)
}
