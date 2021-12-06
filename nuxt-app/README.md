# id.kb.se

Server-side rendered Vue.js application (using [NuxtJS](https://nuxtjs.org/)).

## Requirements

* This application requires a JSON-LD API to connect to. See [librisxl](libris/librisxl).

## Build Setup

Create an `.env` config in the root of this repo:   
<sup>If you are serving the API on http://localhost:5000 you can skip this.</sup>
```
$ echo API_PATH=YOUR_URL > .env
```

Yarn commands

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
