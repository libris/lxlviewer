# supersearch

A [Svelte](https://svelte.dev) search component powered by [CodeMirror](https://codemirror.net/).

## Installation

```bash
npm install supersearch
```

## Usage

To use `supersearch` in a Svelte project ...

To use `supersearch` in a non-Svelte project ...

## Properties

| Property            | Type                      | Description                                                                                           | Default value |
| ------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------- | ------------- |
| `name`              | `string`                  | A string specifying a name for the form control.                                                      | `undefined`   |
| `value`             | `string`                  | The value that will be displayed and edited inside the component.                                     | `""`          |
| `form`              | `string`                  | A string matching the `id` of a `<form>` element.                                                     | `undefined`   |
| `language`          | `LanguageSupport`         | The language extension that will parse and highlight the value.                                       | `undefined`   |
| `placeholder`       | `string`                  | A brief hint which is shown when value is empty.                                                      | `""`          |
| `endpoint`          | `string` or `URL`         | The endpoint from which the component should fetch data from (used together with `queryFn`).          | `undefined`   |
| `queryFn`           | `QueryFunction`           | A function that converts `value` to `URLSearchParams` (which will be appended to the endpoint).       | `undefined`   |
| `paginationQueryFn` | `PaginationQueryFunction` | A function which should return `URLSearchParams` used for querying more paginated data (if available) | `undefined`   |
| `transformFn`       | `TransformFunction`       | A generic helper function which can be used to transform data fetched from the endpoint.              | `undefined`   |
| `extensions`        | `Extension[]`             | A list of extensions which should extend the default extensions.                                      | `[]`          |
| `resultItem`        | `Snippet<[ResultItem]>`   | A [Snippet](https://svelte.dev/docs/svelte/snippet) used for customized rendering of result items.    | `undefined`   |
| `debouncedWait`     | `number`                  | The wait time, in milliseconds that debounce function should wait between invocated search queries.   | `300`         |

&nbsp;
Supersearch also exports a `lxlQualifierPlugin` that can be used (passed to the extensions prop) if you want atomic, stylable, removable, labeled pills from some key-value pairs in your editor. This requires:

- Your language exporting `Qualifier` nodes consisting of `QualifierKey`, `QualifierOperator` and `QualifierValue` (i.e `key:value`).
- Your pass a function of type `GetLabelFunction`, returning labels to be displayed and an optional remove link.

## Developing

Install dependencies with `npm install` and start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Everything inside `src/lib` is part of the library, everything inside `src/routes` can be used as a showcase or preview app.

## Building

To build the library:

```bash
npm run package
```

To create a production version of the showcase app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Publishing

Consider adding a `"license"` field and point it to a `LICENSE` file which you can create from a template (one popular option is the [MIT license](https://opensource.org/license/mit/)).

To publish the library to [npm](https://www.npmjs.com):

```bash
npm publish
```
