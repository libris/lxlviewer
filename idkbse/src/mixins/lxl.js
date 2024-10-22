import { mapGetters } from 'vuex';
import * as StringUtil from 'lxljs/string';
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
        if (typeof uri == 'undefined' || uri.length === 0) {
          return null;
        }

        return uri.replace(this.baseUri(), '');
      },
      isInternalUri(uri) {
        if (typeof uri == 'undefined' || uri.length === 0) {
          return false;
        }
        return uri.startsWith(this.baseUri());
      },
      baseUri() {
        return this.$config.siteConfig[this.appState.domain].baseUri;
      },
      translateUriEnv(uri) {
        return this.$translateAliasedUri(uri)
      },
      activeHost() {
        return this.$translateAliasedUri(this.baseUri())
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
