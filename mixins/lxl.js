import { mapGetters } from 'vuex';

import Vue from "vue"

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
      ...mapGetters(['vocab', 'vocabMap']),
    },
    methods: {
      translateKey(key) {
        const term = this.vocabMap[`https://id.kb.se/vocab/${key}`];
        const labelByLangObj = term ? term.labelByLang : null;
        return labelByLangObj ? labelByLangObj['sv'] || labelByLangObj['en'] : key;
      },
      getEntityTitle(entity) {
        if (entity.prefLabel) {
          return entity.prefLabel;
        }
        if (entity.label) {
          return entity.label;
        }
        if (entity.labelByLang) {
          return entity.labelByLang['sv'] || entity.labelByLang['en'];
        }
        return 'Unnamed';
      },
    },
  });
}
