<script>
import * as DisplayUtil from '../../utils/display';
import * as StringUtil from '../../utils/string';
import * as RecordUtil from '../../utils/record';
import * as HttpUtil from '../../utils/http';
import { mapGetters } from 'vuex';
import Modernizr from '@/../.modernizrrc.js';

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
  events: {
  },
  methods: {
    buildItem() {
      const embellishedReference = DisplayUtil.getCard(
        this.inspector.data.mainEntity, 
        this.resources.display, 
        this.inspector.data.quoted, 
        this.resources.vocab, 
        this.settings, 
        this.resources.context);
      embellishedReference['@id'] = this.inspector.data.mainEntity['@id'];

      this.itemData = RecordUtil.getItemObject(
        this.inspector.data.mainEntity['@id'],
        `https://libris.kb.se/library/${this.user.settings.activeSigel}`,
        embellishedReference
      );

      this.$parent.setCheckingRelations(false);
    },
    fetchHolding() {
      HttpUtil.get({ 
        url: this.holdingId[0], 
        accept: 'application/ld+json' }).then((getResult) => {
        const newData = RecordUtil.splitJson(getResult);
        if (Modernizr.history) {
          history.pushState(newData, 'unused', `${this.holdingId[0]}/edit`);
          
          this.$store.dispatch('updateInspectorData', { 
            property: 'new-editordata', 
            value: newData
          });
          //this.$dispatch('new-editordata', newData);
        } else if (result.status === 201) {
          window.location = result.getResponseHeader('Location');
        } else {
          this.syncData(newData);
        }

        this.$store.dispatch('setStatusValue', { 
          property: 'inEdit', 
          value: false
        });

      }, (error) => {
        this.changeNotification('color', 'red');
        this.changeNotification('message', `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error}`);
      });
    },
    previewHolding() {
      if (Modernizr.history) {
        this.$store.dispatch('setStatusValue', { 
          property: 'isNew', 
          value: true 
        });
        this.$store.dispatch('updateInspectorData', { 
          property: 'new-editordata', 
          value: newData
        });
        //this.$dispatch('new-editordata', this.itemData);
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
  mounted() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      this.buildItem();
    });
  },
};
</script>

<template>
  <div class="HoldingActions create-item-button-container">
    <!--<form method="POST" action="/edit">-->
      <!--<textarea id="copyItem" name="data" class="hidden">{{itemData | json}}</textarea>-->
      <button class="btn btn-default HoldingActions-btn"
        v-if="!hasHolding || checkingHolding" 
        @click="previewHolding()" 
        :disabled="disabled" 
        :class=" {'disabled': disabled} ">
        <i class="fa fa-plus"
          v-if="!hasHolding && !checkingHolding"></i>
        <i class="fa fa-fw fa-circle-o-notch fa-spin"
          v-if="checkingHolding"></i>
        {{"Add holding" | translatePhrase}}
        <span>({{user.settings.activeSigel}})</span>
      </button>
      <button class="btn btn-default HoldingActions-btn"
        v-if="hasHolding" 
        :class="{'green': hasHolding, 'disabled': disabled}"  
        :disabled="disabled" 
        @click.prevent="fetchHolding()">
        <i class="fa fa-check"
          v-if="hasHolding && !checkingHolding"></i>
        {{"Show holding" | translatePhrase}}
        <span>({{user.settings.activeSigel}})</span>
      </button>
    <!--</form>-->
  </div>
</template>

<style lang="less">

.HoldingActions {
  &-btn {

  }
}

</style>
