<script>
/*
  Available props:
    * documentId  - String, Which reference should be used in the list
    * tag         - String, what tag we are operating on
*/
import * as StringUtil from '@/utils/string';
import { mapGetters } from 'vuex';

export default {
  name: 'tag-switch',
  props: {
    documentId: {
      type: String,
      default: '',
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
      this.$store.dispatch('mark', { tag: this.tag, documentId: this.documentId });
    },
    unmark() {
      this.$store.dispatch('unmark', { tag: this.tag, documentId: this.documentId });
    },
  },
  computed: {
    ...mapGetters([
      'user',
      'userStorage',
      'userCare',
      'userFavorites',
    ]),
    iconString() {
      let str = 'fa-';
      switch (this.tag) {
        case 'Favorite':
          str += 'star';
          break;
        case 'Directory care':
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
        case 'Favorite':
          bool = this.userFavorites.indexOf(this.documentId) >= 0;
          break;
        case 'Directory care':
          bool = this.userCare.indexOf(this.documentId) >= 0;
          break;
        default:
          bool = false;
      }
      return bool;
    },
    tooltip() {
      let str = '';
      if (!this.isMarked) {
        str += StringUtil.getUiPhraseByLang(this.actionLabels.on, this.user.settings.language);
      } else {
        str += StringUtil.getUiPhraseByLang(this.actionLabels.off, this.user.settings.language);
      }
      str += ` ${StringUtil.getUiPhraseByLang(this.tag, this.user.settings.language).toLowerCase()}`;
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
    <i :class="`fa ${iconString}`"></i>
  </div>
</template>

<style lang="less">
.TagSwitch {
  display: inline-block;
  margin: 0 0.25em;
  cursor: pointer;
}

</style>
