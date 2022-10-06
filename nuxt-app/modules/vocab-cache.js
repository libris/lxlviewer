import fetch from "node-fetch";
import {CONTEXT, DISPLAY, translateAliasedUri, VOCAB} from "../plugins/env";
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

async function fetchVocab() {
  const vocabCache = {};

  await Promise.all([
    fetch(translateAliasedUri(CONTEXT)).then(toJson),
    fetch(translateAliasedUri(VOCAB)).then(toJson),
    fetch(translateAliasedUri(DISPLAY)).then(toJson)
  ])
    .then(v => {
      let context, vocab, display;
      [context, vocab, display] = v;

      vocabCache.context = VocabUtil.preprocessContext(context)['@context'];
      vocabCache.vocab = vocab;
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

  async function getVocab() {
    if (!cache || cache.error) {
      cache = await fetchVocab();
    }

    return cache;
  }

  // called before server-side rendering
  this.nuxt.hook("vue-renderer:ssr:prepareContext", async (ssrContext) => {
    ssrContext.$vocab = await getVocab();
  });
}
