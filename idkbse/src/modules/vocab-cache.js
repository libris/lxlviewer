import fetch from "node-fetch";
import {translateAliasedUri} from "../plugins/env";
import * as VocabUtil from "lxljs/vocab";
import * as DisplayUtil from "lxljs/display";

const toJson = response => {
  if (response.ok) {
    return response.json()
  }
  else {
    throw { statusCode: response.status }
  }
}

async function fetchVocab(publicRuntimeConfig) {
  const vocabCache = {};

  await Promise.all([
    fetch(translateAliasedUri(publicRuntimeConfig.context, publicRuntimeConfig.siteAlias)).then(toJson),
    fetch(translateAliasedUri(publicRuntimeConfig.vocab, publicRuntimeConfig.siteAlias)).then(toJson),
    fetch(translateAliasedUri(publicRuntimeConfig.display, publicRuntimeConfig.siteAlias)).then(toJson)
  ])
    .then(v => {
      let context, vocab, display;
      [context, vocab, display] = v;

      vocabCache.context = VocabUtil.preprocessContext(context)['@context'];
      vocabCache.vocab = VocabUtil.preprocessVocab(vocab);
      vocabCache.display = DisplayUtil.expandInherited(display);
    })
    .catch(err => {
      vocabCache.error = { statusCode: err.statusCode || 500, 'message': err.message || ''}
    });

  return vocabCache;
}

export default function (_moduleOptions) {
  // shared by all requests
  let cache;

  async function getVocab(publicRuntimeConfig) {
    if (!cache || cache.error) {
      cache = await fetchVocab(publicRuntimeConfig);
    }

    return cache;
  }

  // called before server-side rendering
  this.nuxt.hook("vue-renderer:ssr:prepareContext", async (ssrContext) => {
    ssrContext.$vocab = await getVocab(this.options.publicRuntimeConfig);
  });
}
