# LXL Viewer
The frontend of Libris XL project. The vue-client is a static standalone single page application built with Webpack 4 and VueJS 2 (initialized with Vue-CLI 3).

#### Requirements

Requires the following to be installed on the host machine:

* [node.js](http://nodejs.org/)
* [yarn](https://yarnpkg.com/en/docs/install)

* A functional REST-API for the resources (check out [xl_vagrant_up](https://github.com/libris/xl_vagrant_up))

##### Tools and Frameworks
* [VueJS](https://vuejs.org/)
* [Webpack](https://webpack.js.org/)

##### Coding Standard
* [SUIT CSS](https://suitcss.github.io/)
* [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript/) (with our own modifications, see `package.json` in `./viewer/vue-client`)

## Setup

    $ cp instance/config.cfg.in instance/config.cfg

Get variables from a developer at KB for `config.cfg`.

    $ cd viewer/vue-client && yarn install

In `./viewer/vue-client/.env.development`, input the path to your REST-API (if not standard) and auth URL.


## Building

```

# serve with hot reload at localhost:8080
$ yarn serve

# build for production with minification
$ yarn build

```

## Testing

```

# Fix this section

```
