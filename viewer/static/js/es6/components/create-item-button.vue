<script>
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData, getStatus } from '../vuex/getters';
import * as DisplayUtil from '../utils/display';
import * as StringUtil from '../utils/string';
import * as RecordUtil from '../utils/record';

export default {
  name: 'create-item-button',
  props: {
    hasHolding: false,
    checkingHolding: true,
    holdingId: '',
    disabled: false,
  },
  data() {
    return {
      itemData: {},
    }
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
      status: getStatus,
    },
  },
  methods: {
    buildItem() {
      const embellishedReference = DisplayUtil.getCard(this.editorData.mainEntity, this.display, this.editorData.quoted, this.vocab, this.settings);
      embellishedReference['@id'] = this.editorData.mainEntity['@id'];

      this.itemData = RecordUtil.getItemObject(
        this.editorData.mainEntity['@id'],
        `https://libris.kb.se/library/${this.settings.userSettings.currentSigel}`,
        embellishedReference
      );
    },
    fetchHolding() {
      window.location = this.holdingId;
    }
  },
  computed: {
  },
  components: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      this.buildItem();
    });
  },
};
</script>

<template>
  <div class="create-item-button-container">
    <form method="POST" action="/edit">
      <textarea id="copyItem" name="data" class="hidden">{{itemData | json}}</textarea>
      <button v-if="!hasHolding || checkingHolding" type="submit" :disabled="disabled">
        <i v-if="!hasHolding && !checkingHolding" class="fa fa-plus"></i>
        <i v-if="checkingHolding" class="fa fa-fw fa-circle-o-notch fa-spin"></i>
        {{"Item" | translatePhrase}}
      </button>
      <button v-if="hasHolding" :class="{'green': hasHolding}" :disabled="disabled" @click.prevent="fetchHolding()">
        <i v-if="hasHolding && !checkingHolding" class="fa fa-check"></i> 
        {{"Item" | translatePhrase}}
        <span>({{settings.userSettings.currentSigel}})</span>
      </button>
    </form>
  </div>
</template>

<style lang="less">
@import './_variables.less';
.create-item-button-container{
  button {
    height: 2.2em;
    border-radius: 3px;
    font-weight: normal;
    color: @white;
    background: @holding-color;
    &.green {
      background: #4cba2a;
    }
  }

}
</style>
