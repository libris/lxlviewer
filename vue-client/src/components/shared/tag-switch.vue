<script>
/*
  Available props:
    * document  - The mainEntity from which to extract id and title
    * tag         - String, what tag we are operating on
*/
import { mapGetters } from 'vuex';
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
  data() {
    return {
    };
  },
  methods: {
    toggleMark() {
      if (!this.isMarked) {
        this.mark();
      } else {
        this.unmark();
      }
    },
    mark() {
      this.$store.dispatch('mark', { tag: this.tag, documentId: this.documentId, documentTitle: this.documentTitle });
    },
    unmark() {
      this.$store.dispatch('unmark', { tag: this.tag, documentId: this.documentId });
    },
  },
  computed: {
    ...mapGetters([
      'user',
      'userStorage',
      'userFlagged',
      'userBookmarks',
      'settings',
      'resources',
      'inspector',
    ]),
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
    iconString() {
      let str = 'fa-';
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
      if (!this.isMarked) {
        str += '-o';
      }
      return str;
    },
    isMarked() {
      let bool = false;
      switch (this.tag) {
        case 'Bookmark':
          bool = this.userBookmarks.some((el) => el['@id'] === this.documentId);
          break;
        case 'Flagged':
          bool = this.userFlagged.some((el) => el['@id'] === this.documentId);
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
  components: {
  },
  watch: {
  },
  mounted() {
    this.$nextTick(() => {});
  },
};
</script>

<template>
  <div class="TagSwitch" v-tooltip.top="tooltip" @click="toggleMark()">
    <i :class="`fa fa-fw ${iconString}`" />
  </div>
</template>

<style lang="less">
.TagSwitch {
  display: inline-block;
  margin: 0 0.25em;
  font-size: 1.4rem;

  cursor: pointer;
  .fa-flag {
    color: @brand-accent;
  }
  .fa-star {
    color: #d6b400;
  }
}

</style>
