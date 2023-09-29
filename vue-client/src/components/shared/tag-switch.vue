<script>
/*
  Available props:
    * document  - The mainEntity from which to extract id and title
    * tag         - String, what tag we are operating on
*/
import { mapActions, mapState } from 'pinia';
import { useResourcesStore } from '@/stores/resources';
import { useInspectorStore } from '@/stores/inspector';
import { useUserStore } from '@/stores/user';
import { useSettingsStore } from '@/stores/settings';
import * as StringUtil from 'lxljs/string';
import * as DisplayUtil from 'lxljs/display';

export default {
  name: 'tag-switch',
  props: {
    document: {
      type: Object,
      default: () => {},
    },
    tag: {
      type: String,
      default: '',
    },
    actionLabels: {
      type: Object,
      default: () => ({ on: 'Mark', off: 'Unmark' }),
    },
  },
  methods: {
    ...mapActions(useUserStore, ['markDocument', 'unmarkDocument']),
    toggleMark() {
      if (!this.isMarked) {
        this.mark();
      } else {
        this.unmark();
      }
    },
    mark() {
      this.markDocument({
        tag: this.tag,
        documentId: this.documentId,
        documentTitle: this.documentTitle
      });
    },
    unmark() {
      this.unmarkDocument({
        tag: this.tag,
        documentId: this.documentId
      });
    },
  },
  computed: {
    ...mapState(useResourcesStore, ['resources']),
    ...mapState(useInspectorStore, ['inspector']),
    ...mapState(useUserStore, ['user', 'userStorage', 'userFlagged', 'userBookmarks']),
    ...mapState(useSettingsStore, ['settings']),
    documentId() {
      return this.document['@id'];
    },
    documentTitle() {
      return DisplayUtil.getItemLabel(
        this.document,
        this.resources,
        this.inspector.data.quoted,
        this.settings,
      );
    },
    iconStyle() {
      if (this.isMarked) {
        return 'fas'
      }
      return 'far'
    },
    iconString() {
      let str = '';
      switch (this.tag) {
        case 'Bookmark':
          str += 'star';
          break;
        case 'Flagged':
          str += 'flag';
          break;
        default:
          return false;
      }
      return str;
    },
    isMarked() {
      let bool = false;
      switch (this.tag) {
        case 'Bookmark':
          bool = this.userBookmarks.some(el => el['@id'] === this.documentId);
          break;
        case 'Flagged':
          bool = this.userFlagged.some(el => el['@id'] === this.documentId);
          break;
        default:
          bool = false;
      }
      return bool;
    },
    tooltip() {
      let str = '';
      if (!this.isMarked) {
        str += StringUtil.getUiPhraseByLang(this.actionLabels.on, this.user.settings.language, this.resources.i18n);
      } else {
        str += StringUtil.getUiPhraseByLang(this.actionLabels.off, this.user.settings.language, this.resources.i18n);
      }
      str += ` ${StringUtil.getUiPhraseByLang(this.tag, this.user.settings.language, this.resources.i18n).toLowerCase()}`;
      return str;
    },
  },
};
</script>

<template>
  <div class="TagSwitch" v-tooltip.top="tooltip" @click="toggleMark()">
    <i :class="`fa fa-fw ${iconString}`"></i>
  </div>
</template>

<style lang="scss">
.TagSwitch {
  display: inline-block;
  margin: 0 0.25em;
  font-size: 1.4rem;

  cursor: pointer;
  .fa-flag[data-prefix="fas"]{
    color: $brand-accent;
  }
  .fa-star {
    color: #d6b400;
  }
}

</style>
