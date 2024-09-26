<script>
import { mapGetters } from 'vuex';
import * as LxlDataUtil from 'lxljs/data';
import * as StringUtil from 'lxljs/string';
import * as RecordUtil from '@/utils/record';

export default {
  data() {
    return {
      removed: false,
    };
  },
  methods: {
    importThis() {
      if (this.user.isLoggedIn) {
        const original = LxlDataUtil.splitJson(this.importItem);
        const duplicate = RecordUtil.prepareDuplicateFor(original, this.user, this.settings.keysToClear.remoteImport);
        this.$store.dispatch('setInsertData', duplicate);
        this.$router.push({ path: '/new' });
      } else {
        this.$store.dispatch(
          'pushNotification',
          { type: 'danger',
            message: `${StringUtil.getUiPhraseByLang('You need to be logged in to perform this action', this.user.settings.language, this.resources.i18n)}.` },
        );
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
      'resources',
    ]),
    isImport() {
      if (typeof this.importItem !== 'undefined' && this.importItem['@graph'] && this.importItem['@graph'].length > 0 && this.importItem['@graph'][0].hasOwnProperty('@id')) {
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
