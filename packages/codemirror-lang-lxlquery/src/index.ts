import { parser } from "./syntax.grammar"
import { LRLanguage, LanguageSupport } from "@codemirror/language"
import { styleTags, tags as t } from "@lezer/highlight"

export const lxlQueryLanguage = LRLanguage.define({
  name: "Libris XL query",
  parser: parser.configure({
    props: [
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
