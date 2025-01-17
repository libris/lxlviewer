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

| Property                      | Type                                                        | Description                                                                                                                                  | Default value      |
| ----------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `id`                          | `string`                                                    | A string defining a identifier which must be unique in the whole document.                                                                   | `"supersearch"`    |
| `name`                        | `string`                                                    | A string specifying a name for the form control.                                                                                             | `undefined`        |
| `value`                       | `string`                                                    | The value that will be displayed and edited inside the component.                                                                            | `""`               |
| `form`                        | `string`                                                    | A string matching the `id` of a `<form>` element.                                                                                            | `undefined`        |
| `language`                    | `LanguageSupport`                                           | The language extension that will parse and highlight the value.                                                                              | `undefined`        |
| `placeholder`                 | `string`                                                    | A brief hint which is shown when value is empty.                                                                                             | `""`               |
| `endpoint`                    | `string` or `URL`                                           | The endpoint from which the component should fetch data from (used together with `queryFn`).                                                 | `undefined`        |
| `queryFn`                     | `QueryFunction`                                             | A function that converts `value` to `URLSearchParams` (which will be appended to the endpoint).                                              | `undefined`        |
| `paginationQueryFn`           | `PaginationQueryFunction`                                   | A function which should return `URLSearchParams` used for querying more paginated data (if available)                                        | `undefined`        |
| `transformFn`                 | `TransformFunction`                                         | A generic helper function which can be used to transform data fetched from the endpoint.                                                     | `undefined`        |
| `extensions`                  | `Extension[]`                                               | A list of extensions which should extend the default extensions.                                                                             | `[]`               |
| `comboboxAriaLabel`           | `string`                                                    | A string defining an optional aria label for the combobox                                                                                    | `undefined`        |
| `resultItem`                  | `Snippet<[ResultItem, getCellId, isFocusedCell, rowIndex]>` | A [Snippet](https://svelte.dev/docs/svelte/snippet) used for customized rendering of result items. See [Custom result items](#result-items). | `undefined`        |
| `persistentItem`              | `Snippet<[getCellId, isFocusedCell]>`                       | An optional Snippet used for adding persitent items (placed before result items).                                                            | `undefined`        |
| `loadingIndicator`            | `Snippet`                                                   | A Snippet used for rendering a loading indicator.                                                                                            | `undefined`        |
| `submitAction`                | `Snippet<[onclick]>`                                        | An optional Snippet for adding a custom submit button                                                                                        | `undefined`        |
| `clearAction`                 | `Snippet<[onclick]>`                                        | An optional Snippet for adding a clear button (used for clearing the input)                                                                  | `undefined`        |
| `closeAction`                 | `Snippet<[onclick]>`                                        | An optional Snippet for adding a close button (used for closing the expanded search)                                                         | `undefined`        |
| `closeActionMediaQueryString` | `string`                                                    | A string defining when the close action button should be visible (only shown on expanded search).                                            | `max-width: 640px` |
| `defaultFocusedRow`           | `number`                                                    | An integer defining which result item row should be focused by default (use `-1` if no row should be focused).                               | `0`                |
| `toggleWithKeyboardShortcut`  | `boolean`                                                   | Controls if expanded search should be togglable using `cmd+k`(macOS) and `ctrl+k` (Linux/Windows)                                            | `false`            |
| `debouncedWait`               | `number`                                                    | The wait time, in milliseconds that debounce function should wait between invocated search queries.                                          | `300`              |
| `isLoading`                   | `boolean`                                                   | A bindable prop telling if the component is currently loading data (the prop should be treated as readonly)                                  | `undefined`        |
| `hasData`                     | `boolean`                                                   | A bindable prop telling if the component has data (the prop should be treated as readonly)                                                   | `undefined`        |

&nbsp;
Supersearch also exports a `lxlQualifierPlugin` that can be used (passed to the extensions prop) if you want atomic, stylable, removable, labeled pills from some key-value pairs in your editor. This requires:

- Your language exporting `Qualifier` nodes consisting of `QualifierKey`, `QualifierOperator` and `QualifierValue` (i.e `key:value`).
- Passing a function of type `GetLabelFunction`, returning labels to be displayed, an optional remove link and an optional `invalid` flag, which enables styling of invalid queries.

## Implementing the component in your project

TODO: Write more documentation here...

### Custom Result items

Custom result items can be defined as a [Snippet](https://svelte.dev/docs/svelte/snippet) passed as a `resultItem` prop.

The follwing snippet params are available (in order):

1. `ResultItem`- An individual item of the resulting data from `queryFn` and `transformFn`. The data inside can be of arbitary shape so they can be rendered in any shape you want.

2. `getCellId<[cellIndex: number]>` - A helper function to get a calculated ID for the cell (e.g. `#supersearch-item-0x0`) by passing a cell/column index value. This enables assistive technologies to know which element the application regards as focused while DOM focus remains on the input element.

3. `isFocusedCell[cellIndex: number]` - A helper function which returns a boolean value if the cell is focused (useful for styling).

4. `rowIndex` - Integer defining the current row index of the result item.

Each interactable cell element (button or links) should have the `role="gridcell"` attribute and an ID generated by the `getCellId` helper function from the snippet params. Some sort of focused styling should also be applied using `isFocusedCell` from the snippet params.

## Developing

Install dependencies with `npm install` and start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Everything inside `src/lib` is part of the library, everything inside `src/routes` can be used as a showcase or preview app.

To watch `src/lib` and rebuild when it changes:

```bash
npm run watch
```

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
