# LXL Viewer
The frontend of Libris XL project. The v2 client is a static standalone single page application built with Webpack 3 and VueJS 2 (based on [this template](http://vuejs-templates.github.io/webpack/)).

#### Requirements

Requires the following to be installed on the host machine:

* [node.js](http://nodejs.org/) 
* [npm](https://www.npmjs.com/)

* A functional REST-API for the resources (check out [xl_vagrant_up](https://github.com/libris/xl_vagrant_up))

##### Tools and Frameworks
* [VueJS](https://vuejs.org/)
* [Webpack](https://webpack.js.org/)

##### Coding Standard
* [SUIT CSS](https://suitcss.github.io/)

## Setup

    $ cp instance/config.cfg.in instance/config.cfg

Get variables from a developer at KB for `config.cfg`.

    $ cd viewer/v2client && npm install

    $ cp config/api_config.json.in config/api_config.json


In `api_config.json`, input the path to your REST-API (if not standard) and auth URL.


## Building

```
# run build and then serve with hot reload at localhost:8080
$ npm run start

# serve with hot reload at localhost:8080
$ npm run dev

# build for production with minification
$ npm run build

# build for production and view the bundle analyzer report
$ npm run build --report
```

## Testing

```
# run unit tests
$ npm run unit

# run e2e tests
$ npm run e2e

# run all tests
$ npm test
```
