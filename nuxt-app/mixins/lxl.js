import { mapGetters } from 'vuex';
import * as StringUtil from 'lxljs/string';
import envComputer from '@/plugins/env';
import Vue from "vue"
import rdfTranslations from '@/resources/json/rdfTranslations.json';
import i18n from '@/resources/json/i18n.json';

// Make sure to pick a unique name for the flag
// so it won't conflict with any other mixin.
if (!Vue.__lxl_global_mixin__) {
  Vue.__lxl_global_mixin__ = true
  Vue.mixin({
    data() {
      return {
  
      };
    },
    computed: {
      ...mapGetters(['vocab', 'settings', 'vocabContext', 'resources', 'appState']),
    },
    methods: {
      translateKey(key) {
        const labelByLang = StringUtil.getLabelByLang(key, this.settings.language, this.resources);
        if (labelByLang === key) {
          if (rdfTranslations[this.settings.language] && rdfTranslations[this.settings.language].hasOwnProperty(key)) {
            return rdfTranslations[this.settings.language][key];
          }
        }
        return labelByLang;
      },
      translateUi(phrase) {
        if (i18n[this.settings.language] && i18n[this.settings.language].hasOwnProperty(phrase)) {
          return i18n[this.settings.language][phrase];
        }
        return phrase;
      },
      removeBaseUri(uri) {
        if (typeof uri == 'undefined' || uri.length == 0) {
          return null;
        }
        const bases = this.settings.removableBaseUris[this.appState.domain];
        const envs = ['dev', 'qa', 'stg', 'edu'];
        const computedBases = [];
        bases.forEach((item) => {
          computedBases.push(item);
          if (item && item.includes('libris')) {
            envs.forEach((env) => {
              computedBases.push(item.replace('libris', `libris-${env}`));
            });
          } else if (item) {
            envs.forEach((env) => {
              computedBases.push(item.replace('id', `id-${env}`));
            });
          }
        });
        const base = computedBases.find(base => uri.includes(base));
        return uri.replace(base, '/');
      },
      translateUriEnv(uri) {
        if (typeof uri == 'undefined' || uri.length == 0) {
          return null;
        }
        // Libris
        if (uri.includes('https://libris.kb.se')) {
          return uri.replace('https://libris.kb.se', envComputer(process.env.ENV, 'libris'));
        }
        // Not libris
        if (uri.includes('https://id.kb.se')) {
          return uri.replace('https://id.kb.se', envComputer(process.env.ENV, 'id'));
        }
        return uri;
      },
      getEntityTitle(entity) {
        if (entity != null) {
          if (entity.prefLabel) {
            return entity.prefLabel;
          }
          if (entity.label) {
            return entity.label;
          }
          if (entity.labelByLang) {
            return entity.labelByLang[this.settings.language] || Object.values(entity.labelByLang)[0];
          }
          if (entity.titleByLang) {
            return entity.titleByLang[this.settings.language] || Object.values(entity.titleByLang)[0];
          }
        }
        return 'Unnamed';
      },
    },
  });
}
