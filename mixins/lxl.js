import { mapGetters } from 'vuex';
import * as StringUtil from '@/utils/string';
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
      ...mapGetters(['vocab', 'settings', 'vocabContext']),
    },
    methods: {
      translateKey(key) {
        return StringUtil.getLabelByLang(key, this.settings.language, this.vocab, this.vocabContext);
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
            return entity.labelByLang['sv'] || entity.labelByLang['en'];
          }
          if (entity.titleByLang) {
            return entity.titleByLang['sv'] || entity.titleByLang['en'];
          }
        }
        return 'Unnamed';
      },
    },
  });
}
