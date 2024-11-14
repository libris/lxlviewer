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

| Property      | Type              | Description                                                       | Default value |
| ------------- | ----------------- | ----------------------------------------------------------------- | ------------- |
| `name`        | `string`          | A string specifying a name for the form control.                  | `undefined`   |
| `value`       | `string`          | The value that will be displayed and edited inside the component. | `""`          |
| `form`        | `string`          | A string matching the `id` of a `<form>` element.                 | `undefined`   |
| `language`    | `LanguageSupport` | The language extension that will parse and highlight the value.   | `undefined`   |
| `placeholder` | `string`          | A brief hint which is shown when value is empty.                  | `""`          |

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
