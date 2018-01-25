# LXL Viewer

## Requirements

Requires the following to be installed on the host machine:

* [Python 2.7](http://python.org/)
* [Pip](https://pip.pypa.io/) (commonly installed along with Python on modern distros)
* [Node](http://nodejs.org/) and [NPM](https://www.npmjs.com/)


(It is recommended to create a virtualenv for hosting self-contained Python
environments)

Run:

    $ pip install -r requirements.txt


## Building

Initially and whenever the repo is updated, build the web assets:

    $ cd viewer/client && npm i

## Running

### Libris XL Infrastructure Needed for Local Development

Requires PostgreSQL and Elasticsearch containing "Definitions" data, and the LibrisXL REST API.

Get it all in place by spinning up the [`xl_vagrant_up`](https://github.com/libris/xl_vagrant_up/)
Vagrant box. If rolling your own server environment, update `DBHOST`, `DBUSER`, `ESHOST`, and
`WHELK_REST_API_URL` config settings accordingly.

For authenticating using [login.libris.kb.se](https://login.libris.kb.se), add
the client secret to `instance/config.cfg` and insert the following record in `/etc/hosts` file:

    127.0.0.1       localhost.tech


## Starting the Flask Application

    $ python serve.py

This will serve:

* Libris Katalogiseringsverktyg on <http://localhost.tech:5000/>
* `id.kb.se` on <http://localhost:5000/>  


## Managing CSS and JS Resources

Go to the viewer subdirectory:

    $ cd viewer/client/

Initial setup:

    $ npm install

During development:

    $ npm run watch

Separately building app files:

    $ npm run app

Updating vendor dependencies:

    $ npm run vendor

## Linting

    $ npm run app:eslint

Or just lint with your plugin of choice, as long as it uses the config defined in ``.eslintrc``.

Make sure to activate linting of ``.html`` files so that eslint will lint your ``.vue`` files.

Read more about the eslint-config at [airbnb/javascript](https://github.com/airbnb/javascript).

## Tests

Requires installing tests prerequsites see [tests documentation](/test)


Run nightwatch e2e tests with default browser (Firefox)

    $ npm run test

Run nightwatch e2e tests with Chrome

    $ npm run test:chrome

Run unit tests

    $ npm run test:unit
