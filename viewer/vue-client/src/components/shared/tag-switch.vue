<script>
/*
  Available props:
    * documentId  - String, Which reference should be used in the list
    * tag         - String, what tag we are operating on
*/
import * as StringUtil from '@/utils/string';
import { cloneDeep } from 'lodash-es';
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
      const userStorage = cloneDeep(this.userStorage);
      const tag = this.tag;
      const id = this.documentId;
      if (userStorage.list.hasOwnProperty(id)) {
        if (userStorage.list[id].indexOf(tag) < 0) {
          userStorage.list[id].push(tag);
        }
      } else {
        userStorage.list[id] = [tag];
      }
      this.$store.dispatch('setUserStorage', userStorage);
    },
    unmark() {
      const userStorage = cloneDeep(this.userStorage);
      const tag = this.tag;
      const id = this.documentId;
      if (userStorage.list.hasOwnProperty(id)) {
        if (userStorage.list[id].indexOf(tag) >= 0) {
          userStorage.list[id].splice(userStorage.list[id].indexOf(tag), 1);
          if (userStorage.list[id].length === 0) {
            delete userStorage.list[id];
          }
        }
      }
      this.$store.dispatch('setUserStorage', userStorage);
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
        str += StringUtil.getUiPhraseByLang('Mark', this.user.settings.language);
      } else {
        str += StringUtil.getUiPhraseByLang('Unmark', this.user.settings.language);
      }
      str += ` ${StringUtil.getUiPhraseByLang(this.tag, this.user.settings.language)}`;
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
