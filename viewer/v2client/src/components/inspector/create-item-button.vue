<script>
import * as DisplayUtil from '@/utils/display';
import * as StringUtil from '@/utils/string';
import * as RecordUtil from '@/utils/record';
import * as DataUtil from '@/utils/data';
import * as HttpUtil from '@/utils/http';
import RoundButton from '@/components/shared/round-button.vue';
import TooltipComponent from '@/components/shared/tooltip-component';
import { mapGetters } from 'vuex';
import Modernizr from '@/../.modernizrrc.js';

export default {
  name: 'create-item-button',
  props: {
    hasHolding: false,
    checkingHolding: true,
    holdingId: '',
    mainEntity: null, // mainEntity of the record we want to create item on
    disabled: false,
    compact: false,
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
        this.mainEntity, 
        this.resources.display, 
        this.inspector.data.quoted, 
        this.resources.vocab, 
        this.settings, 
        this.resources.context);
      embellishedReference['@id'] = this.mainEntity['@id'];

      this.itemData = RecordUtil.getItemObject(
        this.mainEntity['@id'],
        `https://libris.kb.se/library/${this.user.settings.activeSigel}`,
        embellishedReference
      );

      this.$emit('done');
    },
    gotoHolding() {
      const locationParts = this.holdingId.split('/');
      const fnurgel = locationParts[locationParts.length-1];
      this.$router.push({ path: `/${fnurgel}` });
    },
    previewHolding() {
      this.$store.dispatch('setInsertData', DataUtil.getMergedItems(this.itemData.record, this.itemData.mainEntity, null, this.itemData.quoted));
      this.$router.push({ path: '/new' });
    },
    performItemAction() {
      if (this.hasHolding) {
        this.gotoHolding();
      } else {
        this.previewHolding();
      }
    },
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
    'round-button': RoundButton,
    'tooltip-component': TooltipComponent,
  },
  mounted() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      this.buildItem();
    });
  },
};
</script>

<template>
  <div class="CreateItem create-item-button-container">
    <!--<textarea id="copyItem" name="data" class="hidden">{{itemData | json}}</textarea>-->
    <template v-if="!compact">
      <button class="btn btn--lg CreateItem-btn"
        v-if="!hasHolding || checkingHolding" 
        @click="previewHolding()" 
        :disabled="disabled" 
        :class=" {'is-disabled': disabled, 'btn-primary': !disabled} ">
        <i class="fa fa-plus-circle"
          v-if="!hasHolding && !checkingHolding"></i>
        <i class="fa fa-fw fa-circle-o-notch fa-spin"
          v-if="checkingHolding"></i>
        {{"Add holding" | translatePhrase}}
        <span>({{user.settings.activeSigel}})</span>
      </button>
      <button class="btn btn--lg CreateItem-btn"
        v-if="hasHolding" 
        :class="{'CreateItem-btn--hasHolding': hasHolding, 'is-disabled': disabled}"  
        :disabled="disabled" 
        @click.prevent="gotoHolding()">
        <i class="fa fa-check-circle"
          v-if="hasHolding && !checkingHolding"></i>
        {{"Show holding" | translatePhrase}}
        <span>({{user.settings.activeSigel}})</span>
      </button>
    </template>
    <template v-if="compact">
      <round-button 
        :icon="hasHolding ? 'check' : 'plus'"
        :indicator="hasHolding"
        @click="performItemAction()">
        <template slot="tooltip">
          <tooltip-component 
            class="Toolbar-tooltipContainer"
            :show-tooltip="true" 
            position="left"
            :tooltip-text="hasHolding ? 'has holding' : 'Add holding for'" 
            :literalString="{
              position: hasHolding ? 'before' : 'after',
              text: user.settings.activeSigel
            }"
            translation="translatePhrase"></tooltip-component>
        </template>
      </round-button>
    </template>
  </div>
</template>

<style lang="less">

.CreateItem {

  &-btn {
    margin-top: 10px;
    
    &--hasHolding {
      background: @white;
      color: @brand-primary;
      
      &:hover, 
      &:focus,
      &:active {
        background: @white;
        color: @link-hover-color;
      }
    }

    &.is-disabled {
      color: @white;

      &:hover, 
      &:focus,
      &:active {
        background-color: @gray-lighter;
        color: @white;
      }
    }
  }
}

</style>
