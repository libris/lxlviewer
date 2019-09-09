<script>
import * as DisplayUtil from '@/utils/display';
import * as RecordUtil from '@/utils/record';
import * as DataUtil from '@/utils/data';
import * as StringUtil from '@/utils/string';
import * as LayoutUtil from '@/utils/layout';
import RoundedButton from '@/components/shared/rounded-button.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'create-item-button',
  props: {
    hasHolding: {
      type: Boolean,
      default: false,
    },
    checkingHolding: {
      type: Boolean,
      default: true,
    },
    holdingId: {
      type: String,
      default: '',
    },
    mainEntity: null, // mainEntity of the record we want to create item on
    disabled: {
      type: Boolean,
      default: false,
    },
    compact: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      itemData: {},
    };
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
        this.resources.context,
      );
      embellishedReference['@id'] = this.mainEntity['@id'];

      this.itemData = RecordUtil.getItemObject(
        this.mainEntity['@id'],
        this.user.getActiveLibraryUri(),
        embellishedReference,
      );

      this.$emit('done');
    },
    gotoHolding() {
      const locationParts = this.holdingId.split('/');
      const fnurgel = locationParts[locationParts.length - 1];
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
    tooltipText() {
      const str = this.hasHolding ? [this.user.settings.activeSigel, 'has holding'] : ['Add holding for', this.user.settings.activeSigel];
      return StringUtil.getUiPhraseByLang(str, this.user.settings.language);
    },
    keyBindText() {
      return LayoutUtil.getKeybindingText('add-holding');
    },
  },
  components: {
    'rounded-button': RoundedButton,
  },
  mounted() {
    this.$nextTick(() => {
      this.buildItem();
    });
  },
  watch: {
    'inspector.event'(val) {
      if (val.name === 'form-control' && !this.compact) {
        switch (val.value) { 
          case 'add-holding':
            this.performItemAction();
            break;
          default:
        }
      }
    },
  },
};
</script>

<template>
  <div class="CreateItem create-item-button-container">
    <!--<textarea id="copyItem" name="data" class="hidden">{{itemData | json}}</textarea>-->
    <template v-if="!compact">
      <button class="btn btn--md CreateItem-btn"
        v-if="!hasHolding || checkingHolding" 
        @click="previewHolding()" 
        :disabled="disabled" 
        :class=" {'is-disabled': disabled, 'btn-primary': !disabled} "
        v-tooltip.top="keyBindText">
        <i class="fa fa-plus-circle"
          v-if="!hasHolding && !checkingHolding"></i>
        <i class="fa fa-fw fa-circle-o-notch fa-spin"
          v-if="checkingHolding"></i>
        {{"Add holding" | translatePhrase}}
        <span>({{user.settings.activeSigel}})</span>
      </button>
      <button class="btn btn--md CreateItem-btn"
        v-if="hasHolding" 
        :class="{'CreateItem-btn--hasHolding': hasHolding, 'is-disabled': disabled}"  
        :disabled="disabled" 
        @click.prevent="gotoHolding()"
        v-tooltip.top="keyBindText">
        <i class="fa fa-check-circle"
          v-if="hasHolding && !checkingHolding"></i>
        {{"Show holding" | translatePhrase}}
        <span>({{user.settings.activeSigel}})</span>
      </button>
    </template>
    <template v-if="compact">
      <rounded-button 
        v-tooltip.top="tooltipText"
        :icon="hasHolding ? 'check' : 'plus'"
        :indicator="hasHolding"
        :label="hasHolding ? 
              [user.settings.activeSigel, 'has holding'] : 
              ['Add holding for', user.settings.activeSigel]"
        @click="performItemAction()">
      </rounded-button>
    </template>
  </div>
</template>

<style lang="less">

.CreateItem {
  &-btn {
    box-shadow: none;
    background: @white;
    color: @brand-primary;
    border: 2px solid @brand-primary;
    &:hover, 
    &:focus,
    &:active,
    &:active:focus {
      border-color: @btn-primary--hover;
      background: @white;
      color: @btn-primary--hover;
    }
    &--hasHolding {
      background: @brand-primary;
      color: @white;
      border: none;
      &:hover, 
      &:focus,
      &:active,
      &:active:focus {
        background: @btn-primary--hover;
        color: @white;
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
