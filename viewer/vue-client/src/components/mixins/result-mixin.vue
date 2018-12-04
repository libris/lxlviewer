<script>
import * as DataUtil from '@/utils/data';
import * as RecordUtil from '@/utils/record';
import * as httpUtil from '@/utils/http';
import * as StringUtil from '@/utils/string';
import * as _ from 'lodash';
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      removed: false,
    };
  },
  methods: {
    importThis() {
      if (this.user.isLoggedIn) {
        const original = RecordUtil.splitJson(this.importItem);
        const duplicate = RecordUtil.prepareDuplicateFor(original, this.user, this.settings);
        this.$store.dispatch('setInsertData', duplicate);
        this.$router.push({ path: '/new' });
      } else {
        this.$store.dispatch('pushNotification', { type: 'danger', message: `${StringUtil.getUiPhraseByLang('You need to be logged in to perform this action', this.settings.language)}.` });
      }
    },
  },
  events: {
    'import-this'() {
      this.importThis();
    },
  },
  computed: {
    ...mapGetters([
      'settings',
      'user',
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
