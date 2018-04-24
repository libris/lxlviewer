<script>
import * as DataUtil from '@/utils/data';
import * as httpUtil from '@/utils/http';
import * as StringUtil from '@/utils/string';
import * as _ from 'lodash';
import { mapGetters } from 'vuex';

export default {
  data(){
    return {
      removed: false,
    }
  },
  methods: {
    importThis() {
    //   const json = JSON.stringify(this.importItem);
    //   this.$dispatch('set-import', json);
      this.$store.dispatch('pushNotification', { 
        color: 'grey', 
        message: StringUtil.getUiPhraseByLang(
          'This action is not yet functional. We\'re working on it!', 
          this.settings.language
        ) 
      });
    },
  },
  events: {
    'import-this'(){
      this.importThis();
    },
  },
  computed: {
    ...mapGetters([
      'settings',
    ]),
    isImport() {
      if (typeof this.importItem !== undefined && this.importItem['@graph'] && this.importItem['@graph'].length > 0 && this.importItem['@graph'][0].hasOwnProperty('@id')) {
        return true;
      }
      return false;
    },
  },
  watch: {

  },
};
</script>

<style lang="less">
.import-header {
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
</style>
