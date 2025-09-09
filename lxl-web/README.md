# lxl-web

[![lxl-web](https://github.com/libris/lxlviewer/actions/workflows/lxl-web-tests.yml/badge.svg)](https://github.com/libris/lxlviewer/actions/workflows/lxl-web-tests.yml)

## Developing

Install dependencies with `npm install` (or `pnpm install` or `yarn`).

Add an `.env` file (see `.env.example` for the required environment variables).

Local packages (`supersearch` and `codemirror-lang-lxlquery`) also needs to be prebuilt, the easiest way is by running:

```bash
npm run prebuild-local-packages
```

Start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

To try out a production build locally, build the app with

```bash
npm run build
```

and start it:

```bash
node -r dotenv/config build
```

Here, dotenv is needed to [load the environment variables](https://kit.svelte.dev/docs/adapter-node#environment-variables) from the `.env` file.

## Folder structure

- `src/lib` includes library code (assets, utils and components), which can be imported via the `$lib` alias
- `src/params` contains [param matchers](https://kit.svelte.dev/docs/advanced-routing#matching) used for routing uses dynamic params.
- `src/routes` contains the routes of the application (as well as components that are only used within a single route).
- `static` contains static assets that should be served as-is, like robots.txt or favicon.png.

## Routing structure

SvelteKit uses a filesystem-based router. The routes of the app — i.e. the URL paths that users can access — are defined by the directories in the codebase. Each route directory contains one or more route files, which can be identified by their `+` prefix.

### +page.svelte

A [`+page.svelte`](https://kit.svelte.dev/docs/routing#page-page-svelte) component defines a page of the app. By default, pages are rendered both on the server (SSR) for the initial request and in the browser (CSR) for subsequent navigation.

### +page.ts

The [`+page.ts`](https://kit.svelte.dev/docs/routing#page-page-js) file exports a `load` function which returns the data which the page consumes when rendering. This function runs alongsid `+page.svelte`, which means it runs on the server during server-side rendering and in the browser during client-side navigation.

### +page.server.ts

If your load function can (or should) only run on the server then you can rename `+page.ts` to `+page.server.ts` and change the `PageLoad` type to `PageServerLoad`.

A `+page.server.js` file can also export actions, which allow you to POST data to the server using the `<form>` element. See more here: [Form Actions](https://kit.svelte.dev/docs/form-actions)

### +layout.svelte

The [`+layout.svelte`](https://kit.svelte.dev/docs/routing#layout) component contains elements that should be shared between different pages, such as top-level navigation or a footer.

### +layout.ts

Just like `+page.svelte` loading data from `+page.js`, the `+layout.svelte` component can get data from a load function in `+layout.ts`. This data will be accessible to all nested `load` functions using `await parent()`.
