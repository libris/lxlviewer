<script>
import LensMixin from './mixins/lens-mixin';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  mixins: [LensMixin],
  name: 'entity-summary',
  props: {
    focusData: {},
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
    },
  },
  data() {
    return {
      keyword: '',
    }
  },
  methods: {
    isTitle(key) {
      const k = key.toLowerCase();
      return ~k.indexOf('title') || ~k.indexOf('preflabel');
    },
    showKey(k) {
      const listOfKeys = ['ISBN']; // TODO: Fix list of keys to show.
      return _.indexOf(listOfKeys, k) > -1;
    },
    isInline(k) {
      return (this.settings.inlineKeys.indexOf(k) !== -1);
    },
  },
  computed: {
  },
  components: {
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
  },
};
</script>

<template>
  <div class="entity-summary">
    <span v-if="!getCard">Ohanterad entitet.</span>
    <ul v-if="getCard">
      <li v-for="(k, v) in getCard" v-bind:class="{'large-title': isTitle(k), 'inline': isInline(k) }">
        <span v-if="k === '@type'"><i>{{v | labelByLang}}</i></span>
        <span v-if="k !== '@type'">{{v}}</span>
      </li>
    </ul>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.entity-summary {
  > ul {
    list-style: none;
    padding: 0;
    margin: 0;
    > li {
      padding: 0px;
      &.large-title {
        font-size: 1.6rem;
        font-weight: bold;
      }
    }
  }
}

</style>
