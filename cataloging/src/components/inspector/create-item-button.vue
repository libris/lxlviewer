<script>
import { mapGetters } from 'vuex';
import * as DisplayUtil from 'lxljs/display';
import * as StringUtil from 'lxljs/string';
import * as RecordUtil from '@/utils/record';
import * as DataUtil from '@/utils/data';
import * as LayoutUtil from '@/utils/layout';
import RoundedButton from '@/components/shared/rounded-button.vue';
import { translatePhrase } from '@/utils/filters';

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
  emits: ['done'],
  methods: {
    translatePhrase,
    buildItem() {
      const embellishedReference = DisplayUtil.getCard(
        this.mainEntity,
        this.resources,
        this.inspector.data.quoted,
        this.settings,
      );
      embellishedReference['@id'] = this.mainEntity['@id'];
      embellishedReference['@type'] = this.mainEntity['@type']; // fixes broken itemOf chip FIXME: why does getCard drop @type?

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
    reviewHolding() {
      const merged = DataUtil.getMergedItems(
        this.itemData.record,
        this.itemData.mainEntity,
        null,
        this.itemData.quoted
      );

      this.$store.dispatch('setInsertData', merged);

      this.$router.push({
        path: '/new',
        query: {
          record: JSON.stringify(this.itemData.record),
          entity: JSON.stringify(this.itemData.mainEntity),
          quoted: this.itemData.quoted
        }
      });
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
      if (this.hasHolding) {
        return `${this.user.settings.activeSigel} ${StringUtil.getUiPhraseByLang('has holding', this.user.settings.language, this.resources.i18n)}`;
      }
      return `${StringUtil.getUiPhraseByLang('Add holding for', this.user.settings.language, this.resources.i18n)} ${this.user.settings.activeSigel}`;
    },
    keyBindText() {
      return LayoutUtil.getKeybindingText('add-holding');
    },
    disabled() {
      return this.inspector && this.inspector.status.isNew;
    },
    newItemUrl() {
      return this.$router.resolve({
        path: '/new',
        query: {
          record: JSON.stringify(this.itemData.record),
          entity: JSON.stringify(this.itemData.mainEntity),
          quoted: this.itemData.quoted
        }
      }).href;
    }
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
    <a
      v-if="!hasHolding || checkingHolding"
      :href="newItemUrl"
      @click="previewHolding"
      class="btn btn--md CreateItem-btn"
      :class="{ 'is-disabled': disabled, 'btn-primary': !disabled }"
      v-tooltip.top="keyBindText"
    >
      <i class="fa fa-plus-circle" v-if="!hasHolding && !checkingHolding" />
      <i class="fa fa-fw fa-circle-o-notch fa-spin" v-if="checkingHolding" />
      {{ translatePhrase("Add holding") }}
      <span>({{ user.settings.activeSigel }})</span>
    </a>
      <button
        class="btn btn--md CreateItem-btn"
        v-if="hasHolding"
        :class="{ 'CreateItem-btn--hasHolding': hasHolding, 'is-disabled': disabled }"
        :disabled="disabled"
        @click.prevent="gotoHolding()"
        v-tooltip.top="keyBindText">
        <i
          class="fa fa-check-circle"
          v-if="hasHolding && !checkingHolding" />
        {{ translatePhrase("Show holding") }}
        <span>({{user.settings.activeSigel}})</span>
      </button>
    </template>
    <template v-if="compact">
      <rounded-button
        v-tooltip.top="tooltipText"
        :icon="hasHolding ? 'check' : 'plus'"
        :indicator="hasHolding"
        :label="hasHolding
          ? `${user.settings.activeSigel} ${translatePhrase('has holding')}`
          : `${translatePhrase('Add holding for')} ${user.settings.activeSigel}`"
        @click="performItemAction()" />
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
        background-color: @grey-lighter;
        color: @white;
      }
    }
  }
}

</style>
