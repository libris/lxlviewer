import {parser} from "./syntax.grammar"
import {LRLanguage, LanguageSupport, indentNodeProp, foldNodeProp, foldInside, delimitedIndent} from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"

export const lxlQueryLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Application: delimitedIndent({closing: ")", align: false})
      }),
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
