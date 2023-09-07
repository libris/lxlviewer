// export * as DisplayUtil from './src/display.js';
// export * as VocabUtil from './src/vocab.js';
// export * as StringUtil from './src/string.js';
import { preprocessResources } from './vocab';
import { initDisplayUtil } from './display';

/**
 * A factory for instantiating LXLJS utils with repetitively passed data (preprocessed `resources` and `settings`).
 * @param {string} resources - containing `context`, `display`, `vocab` (as an object) and `i18n` @see {@link https://github.com/libris/lxlviewer/tree/develop/lxljs#the-resources-parameter | Resources parameter in LXLJS readme}
 * @param {string} settings - containing atleast `language` @see {@link https://github.com/libris/lxlviewer/tree/develop/lxljs#the-settings-parameter | Settings parameter in LXLJS readme} 
 */
export function initLxljsUtils(resources, settings = { language: 'sv' }) {
  const preprocessedResources = preprocessResources(resources);

  return {
    displayUtil: initDisplayUtil(preprocessedResources, settings),
    // TODO: instantiate vocab and string utils here as well...
  };
}
