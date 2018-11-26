# File structure

## Static templates

The static templates are driven by the flask app, written in jinja2 syntax and can be found in the ``templates`` folder.

## JavaScript

The JavaScript in this application is written in ES6 syntax and then transpiled to ES5 by babelify. The build commands can be found in ``package.json``.

### Initalization of the views

The different initalization methods are driven by a small loader (``loader.es6``) which will check the id of the template rendered and run the initalization method in the corresponding view class (``es6/views/``).

### VueJS

The views contain sub-applications written in VueJS. They are initialized by their corresponding view class (see above) and are built up by components defined in ``es6/components``.

For easy component inspection in the browser, install the [vue-devtools](https://github.com/vuejs/vue-devtools) (available for Chrome and Firefox).

### Utility library

All utility functions can be found in ``es6/utils/``.

## Stylesheets

The styles are written in [less](http://lesscss.org/). The base styles are defined in the ``static/less/`` folder, and most of the VueJS components have their own styles in the corresponding ``.vue`` file).

The base stylesheets are split up into 2 separate main-files (``main_id.less`` and ``main_libris.less``) which will build one packaged ``.css`` file **each**. Which css file that is loaded depends on conditions defined in the jinja template ``base.html``.

Each one of these main files include:
* Importing of style libraries (vendor packages handled by bower).
* Importing of styles shared by both services (contained in the ``shared`` folder).
* Color and style variables specific to the service.

## Help documents

The help documentation has been moved to [its own project](https://github.com/libris/lxl-helpdocs).
