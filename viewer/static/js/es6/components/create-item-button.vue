<script>
import { getUser, getSettings, getVocabulary, getContext, getDisplayDefinitions, getEditorData, getStatus } from '../vuex/getters';
import { changeNotification, syncData, changeStatus } from '../vuex/actions';
import * as DisplayUtil from '../utils/display';
import * as StringUtil from '../utils/string';
import * as RecordUtil from '../utils/record';
import * as HttpUtil from '../utils/http';

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
      user: getUser,
      context: getContext,
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
      status: getStatus,
    },
    actions: {
      syncData,
      changeStatus,
      changeNotification,
    },
  },
  methods: {
    buildItem() {
      const embellishedReference = DisplayUtil.getCard(this.editorData.mainEntity, this.display, this.editorData.quoted, this.vocab, this.settings, this.context);
      embellishedReference['@id'] = this.editorData.mainEntity['@id'];

      this.itemData = RecordUtil.getItemObject(
        this.editorData.mainEntity['@id'],
        `https://libris.kb.se/library/${this.user.settings.activeSigel}`,
        embellishedReference
      );
      this.$dispatch('set-checking-relations', false);
    },
    fetchHolding() {
      window.open(this.holdingId[0], '_blank');
    },
    previewHolding() {
      this.$dispatch('preview-holding', this.itemData);
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
    <!--<form method="POST" action="/edit">-->
      <!--<textarea id="copyItem" name="data" class="hidden">{{itemData | json}}</textarea>-->
      <button v-if="!hasHolding || checkingHolding" @click="previewHolding()" :disabled="disabled" :class=" {'disabled': disabled} ">
        <i v-if="!hasHolding && !checkingHolding" class="fa fa-plus"></i>
        <i v-if="checkingHolding" class="fa fa-fw fa-circle-o-notch fa-spin"></i>
        {{"Holding" | translatePhrase}}
        <span>({{user.settings.activeSigel}})</span>
      </button>
      <button v-if="hasHolding" :class="{'green': hasHolding, 'disabled': disabled}" :disabled="disabled" @click.prevent="fetchHolding()">
        <i v-if="hasHolding && !checkingHolding" class="fa fa-check"></i>
        {{"Holding" | translatePhrase}}
        <span>({{user.settings.activeSigel}})</span>
      </button>
    <!--</form>-->
  </div>
</template>

<style lang="less">
@import './_variables.less';
.create-item-button-container{
  button {
    height: 2.2em;
    border-radius: 3px;
    color: @white;
    background: @holding-color;
    &.green {
      background: #4cba2a;
      &:hover, :active {
        background: #4cba2a;
      }
    }
    &:hover {
      background: lighten(@holding-color, 5%);
    }
    &:active {
      background: darken(@holding-color, 5%);
    }
    &.disabled {
      opacity: 0.5;
    }
  }

}
</style>
