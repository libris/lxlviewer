<script>
import * as DisplayUtil from '../../utils/display';
import * as StringUtil from '../../utils/string';
import * as RecordUtil from '../../utils/record';
import * as HttpUtil from '../../utils/http';
import { mapGetters } from 'vuex';

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
      HttpUtil.get({ url: this.holdingId[0], accept: 'application/ld+json' }).then((getResult) => {
        const newData = RecordUtil.splitJson(getResult);
        if (Modernizr.history) {
          history.pushState(newData, 'unused', `${this.holdingId[0]}/edit`);
          this.$dispatch('new-editordata', newData);
        } else if (result.status === 201) {
          window.location = result.getResponseHeader('Location');
        } else {
          this.syncData(newData);
        }
        this.changeStatus('inEdit', false);
      }, (error) => {
        this.changeNotification('color', 'red');
        this.changeNotification('message', `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error}`);
      });
    },
    previewHolding() {
      if (Modernizr.history) {
        this.changeStatus('isNew', true);
        this.$dispatch('new-editordata', this.itemData);
      }
    }
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
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
      <button v-if="!hasHolding || checkingHolding" @click="previewHolding()" :disabled="disabled" class="btn" :class=" {'disabled': disabled} ">
        <i v-if="!hasHolding && !checkingHolding" class="fa fa-plus"></i>
        <i v-if="checkingHolding" class="fa fa-fw fa-circle-o-notch fa-spin"></i>
        {{"Add holding" | translatePhrase}}
        <span>({{user.settings.activeSigel}})</span>
      </button>
      <button v-if="hasHolding" :class="{'green': hasHolding, 'disabled': disabled}" class="btn" :disabled="disabled" @click.prevent="fetchHolding()">
        <i v-if="hasHolding && !checkingHolding" class="fa fa-check"></i>
        {{"Show holding" | translatePhrase}}
        <span>({{user.settings.activeSigel}})</span>
      </button>
    <!--</form>-->
  </div>
</template>

<style lang="less">
.create-item-button-container{
  button {
    height: 2.2em;
    color: @white !important;
    background: @holding-color;
    &.green {
      background: #4cba2a;
      &:hover, &:active {
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
