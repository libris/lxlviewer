# LXL Viewer
This repository contains the code used for two services; [*id.kb.se*](https://id.kb.se) and [*libris cataloging*](https://libris.kb.se/katalogisering). They are both based off a Flask layer, with the difference that the id.kb.se-client is being rendered with jinja templates, and the libris cataloging-service is being rendered into an SPA by VueJS.

The services are built to work on top of the [Libris XL](https://github.com/libris/librisxl) API:s.

## Getting started

### Flask app

#### Requirements

* A functional REST-API for the resources (check out [xl_vagrant_up](https://github.com/libris/xl_vagrant_up))

#### Setup

    $ pip install requirements.txt -r

    $ cp instance/config.cfg.in instance/config.cfg

Get variables from a developer at KB for `config.cfg`.

#### Running

    $ python serve.py

### The static client ([id.kb.se](https://id.kb.se/))

#### Requirements
* A flask app serving the resources (see above)
* [node.js](http://nodejs.org/)
* [npm](https://www.npmjs.com/get-npm) (should already be included with node)

#### Setup

    $ cd viewer/client && npm install

#### Building

    $ npm run build

or

    $ npm run watch

### The vue client ([libris cataloging](https://libris.kb.se/katalogisering))

#### Tools and Frameworks used

No action required here, this is just information.
* [VueJS](https://vuejs.org/)
* [Webpack](https://webpack.js.org/)

#### Coding Standard
* [SUIT CSS](https://suitcss.github.io/)
* [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript/) (with our own modifications, see [`package.json`](/viewer/vue-client/package.json) in `./viewer/vue-client`)

#### Requirements
* A flask app serving the resources (see above)
* [node.js](http://nodejs.org/) >=8.16.2
* [yarn](https://yarnpkg.com/en/docs/install)

#### Setup

    $ cd viewer/vue-client && yarn install

    $ cp .env.development.in .env.development

In `.env.development`, input the path to your flask app REST-API (if not standard). Get `VUE_APP_CLIENT_ID` for local development from a Libris developer.


#### Building

```

# serve with hot reload at localhost:8080
$ yarn serve

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

If you can't load the display file or want to use a local version for any other reason, it's possible to mock it by adding `VUE_APP_MOCK_DISPLAY_BOOL=true` as a row in `.env.development` (in the `vue-client`-folder) and it will use the display file in your local definitions repository. If you want to use the live version, remove the row or set it to `false`.

##### Local help documentation

It is also recommended to use a local version for `lxl-helpdocs` to be able to see the help documentation in your local environment. Just add `VUE_APP_MOCK_HELP_BOOL=true` for this. It will use the local file in your lxl-helpdocs repository.
