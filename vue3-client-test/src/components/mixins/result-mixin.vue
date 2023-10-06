<script>
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useSettingsStore } from '@/stores/settings';
import { useResourcesStore } from '@/stores/resources';
import { useUserStore } from '@/stores/user';
import * as LxlDataUtil from 'lxljs/data';
import * as StringUtil from 'lxljs/string';
import * as RecordUtil from '@/utils/record';
import { useStatusStore } from '@/stores/status';
import { useInspectorStore } from '@/stores/inspector';

export default {
  data() {
    return {
      removed: false,
    };
  },
  methods: {
    ...mapActions(useStatusStore, ['pushNotification']),
    importThis() {
      if (this.user.isLoggedIn) {
        const original = LxlDataUtil.splitJson(this.importItem);
        const duplicate = RecordUtil.prepareDuplicateFor(original, this.user, this.settings.keysToClear.remoteImport);
        this.insertData = duplicate;
        this.$router.push({ path: '/new' });
      } else {
        this.pushNotification({
          type: 'danger',
          message: `${StringUtil.getUiPhraseByLang('You need to be logged in to perform this action', this.user.settings.language, this.i18n)}.`
        });
      }
    },
  },
  events: {
    'import-this'() {
      this.importThis();
    },
  },
  computed: {
    ...mapState(useResourcesStore, ['i18n']),
    ...mapState(useUserStore, ['user']),
    ...mapState(useSettingsStore, ['settings']),
    ...mapWritableState(useInspectorStore, ['insertData']),
    isImport() {
      if (typeof this.importItem !== 'undefined' && this.importItem['@graph'] && this.importItem['@graph'].length > 0 && this.importItem['@graph'][0].hasOwnProperty('@id')) {
        return true;
      }
      return false;
    },
  },
};
</script>

<style lang="scss">
.import-header {
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
</style>
