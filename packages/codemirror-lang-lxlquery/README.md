# LXLQuery language package

A [CodeMirror](https://codemirror.net/6/) language support package for the Libris XL Query language.

- `src/syntax.grammar` contains the grammar covering the language. See the [Lezer system guide](https://lezer.codemirror.net/docs/guide/#writing-a-grammar) for information on this file format.

- `src/index.ts` adds metadata to the language parser.

- `test/cases.txt` contains the grammar tests.

## Develop

`npm run watch` watches for changes in `/src` and builds the language.

See the [language support example](https://codemirror.net/6/examples/lang-package/) for a detailed tutorial on development.

## Build

`npm run prepare`

## Test

`npm run test`
