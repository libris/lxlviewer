# Libris cataloging client
This repository contains the code used for [*libris cataloging*](https://libris.kb.se/katalogisering).

It is a VueJS single page application (SPA) that uses the [Libris XL](https://github.com/libris/librisxl) API:s.

## Getting started

#### Tools and Frameworks used

No action required here, this is just information.
* [VueJS](https://vuejs.org/)
* [Vite](https://vitejs.dev/)

#### Coding Standard
* [SUIT CSS](https://suitcss.github.io/)
* [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript/) (with our own modifications, see [`.eslintrc.js`](/cat/.eslintrc.js))

#### Requirements
* [node.js](http://nodejs.org/) >= 18
* [yarn](https://yarnpkg.com/en/docs/install)

#### Setup

    $ yarn install

    # To only run frontend stuff locally, and use libris-dev as backend:
    $ cp .env.development.in .env.development

    # If you're running both frontend and backend locally:
    $ cp .env.local_backend.in .env.development

In `.env.development`, input the path to your flask app REST-API (if not standard). Get `VUE_APP_CLIENT_ID` for local development from a Libris developer.

#### Further configurations

Most things are controlled in `src/settings.js`, and then exported into the store as the getter `settings`. This file is not environment specific, but some properties inside it varies depending on environment.

#### Building

```

# serve with hot reload at localhost:8080
$ yarn dev

# build for production with minification
$ yarn build

```

#### Running unit tests
```
yarn test:unit
```

#### Running end-to-end tests

The e2e tests have a separate file with environment variables. This should just mirror the .env.development but with `NODE_ENV=production` added.

```
yarn test:e2e
```

or run it headless with

```
yarn test:e2e_ci
```

#### Lint

Will only generate warnings/errors, will not attempt to fix them.

```
yarn lint
```

#### Problems / Troubleshooting

##### Local displayfile

If you can't load the display file or want to use a local version for any other reason, it's possible to mock it by adding `VUE_APP_MOCK_DISPLAY_BOOL=true` as a row in `.env.development` and it will use the display file in your local definitions repository. If you want to use the live version, remove the row or set it to `false`.

##### Local help documentation

It is also recommended to use a local version for `lxl-helpdocs` to be able to see the help documentation in your local environment. Just add `VUE_APP_MOCK_HELP_BOOL=true` for this. It will use the local file in your lxl-helpdocs repository.

## Managing custom font for icons
Font is built using [icomoon.io](https://icomoon.io/). To manage our font upload the json file located at 
`src/assets/fonts/custom-icons.json`. Make the necessary changes and export it by clicking "Generate Font". 
Replace the files in assets/fonts.

["sphere"](https://github.com/Keyamoon/IcoMoon-Free/blob/master/SVG/202-sphere.svg) by [icomoon.io](https://icomoon.io) is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
