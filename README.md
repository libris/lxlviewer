# lxltools-js
JavaScript tools for the Libris XL infrastructure.

## Installation

Install from git repo like so

```
npm install libris/lxltools-js --save
```

```
yarn add libris/lxltools-js --save
```
<sup>Specifiy version as usual if needed</sup>

## Contents

### Display

Functions related to [fresnel](https://www.w3.org/2005/04/fresnel-info/manual/).

### Vocab

Functions related to class structures of our base vocabulary.

### String

String conversions etc.

## Common parameters

### The `settings` parameter

The `settings` parameter should at least contain the property `language` (`sv`, `en` etc). This could be the same object that you use for general settings in your application, if you follow the same pattern.

### The `resources` parameter

The `resources` parameter should be an object. Not all functions require all properties to be present, but a full version contains the following properties:

* `context` - The context in which to run the application. Ie the contents of https://id.kb.se/context.jsonld
* `display` - The fresnel definitions. Ie the contents of https://id.kb.se/vocab/display/data.jsonld
* `vocab` - The base vocabulary as a Map. Ie a map conversion of the graph from https://id.kb.se/vocab/data.jsonld
* `i18n` - Translations. Should be rather optional (translations will just fail if not found)

Depending on your application, you may want to enrich the `resources` object with other things. This is generally not a problem, as long as the properties mentioned above aren't used for this.