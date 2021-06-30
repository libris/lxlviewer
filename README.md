# id.kb.se

Server-side rendered Vue.js application (using [NuxtJS](https://nuxtjs.org/)).

## Requirements

* This application requires a JSON-LD API to connect to. For the time being, that is the flask-layer of [lxlviewer](libris/lxlviewer).
  * The purpose of this application *at this point* is to replace the templating layer of the static parts of lxlviewer.


## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
