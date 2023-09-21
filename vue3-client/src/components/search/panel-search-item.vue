<script>
import { mapState } from 'pinia';
import { useResourcesStore } from '@/stores/resources';
import { useInspectorStore } from '@/stores/inspector';
import { useUserStore } from '@/stores/user';
import { useSettingsStore } from '@/stores/settings';
import { merge, cloneDeep } from 'lodash-es';
import * as StringUtil from 'lxljs/string';
import * as MathUtil from '@/utils/math';
import LensMixin from '../mixins/lens-mixin.vue';
import SummaryAction from '../inspector/summary-action.vue';
import EntitySummary from '../shared/entity-summary.vue';

export default {
  name: 'panel-search-item',
  mixins: [LensMixin],
  props: {
    focusData: {},
    disabledIds: {
      type: Array,
      default: () => [],
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    hasAction: {
      type: Boolean,
      default: false,
    },
    path: {
      type: String,
      default: '',
    },
    isReplaced: {
      type: Boolean,
      default: false,
    },
    isCompact: {
      type: Boolean,
      default: false,
    },
    listItemSettings: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      keyword: '',
    };
  },
  methods: {
    useItem() {
      if (!this.isDisabled && !this.isReplaced) {
        this.$emit('use-item');
      }
    },
  },
  computed: {
    ...mapState(useResourcesStore, ['i18n']),
    ...mapState(useInspectorStore, ['inspector']),
    ...mapState(useUserStore, ['user']),
    ...mapState(useSettingsStore, ['settings']),
    settings() {
      const settings = {
        text: this.text,
        styling: 'primary',
        inspectAction: true,
        path: this.path,
        icon: this.icon,
        excludeProperties: [],
        excludeComponents: [],
      };
      if (typeof this.listItemSettings !== 'undefined') {
        const keys = Object.keys(this.listItemSettings);
        for (let i = 0; i < keys.length; i++) {
          if (this.listItemSettings.hasOwnProperty(keys[i])) {
            settings[keys[i]] = this.listItemSettings[keys[i]];
          }
        }
      }
      return settings;
    },
    addPayload() {
      const updatedListItemSettings = merge({ payload: this.focusData }, cloneDeep(this.settings));
      return updatedListItemSettings;
    },
    reverseLinksAmount() {
      if (typeof this.focusData.reverseLinks === 'undefined') {
        return null;
      }
      return this.focusData.reverseLinks ? MathUtil.getCompactNumber(this.focusData.reverseLinks.totalItems) : 0;
    },
    translatedTooltip() {
      return StringUtil.getUiPhraseByLang('Number of links to entity', this.user.settings.language, this.i18n);
    },
  },
  components: {
    SummaryAction,
    EntitySummary,
  },
};
</script>

<template>
  <li class="PanelSearch-listItem PanelComponent-listItem"
    :class="{ 'is-added' : isDisabled, 'is-replaced' : isReplaced }">
    <div 
      class="PanelSearch-action"
      v-if="hasAction">
      <summary-action 
        :disabled="isDisabled" 
        :replaced="isReplaced"
        :options="addPayload" 
        @action="useItem()">
      </summary-action>
      <div 
        class="PanelSearch-linkCount"
        v-if="reverseLinksAmount !== null"
        :class="{'has-links' : reverseLinksAmount != 0}"
        v-tooltip="{
          placement: 'right',
          content: translatedTooltip,
        }">
        {{ reverseLinksAmount }}
      </div>
    </div>
    <div class="PanelSearch-itemContainer" 
      :class="{'has-action' : hasAction}">
      <EntitySummary
        :focus-data="focusData" 
        :should-link="true" 
        :is-compact="isCompact"
        :label-style="'regular'"
        :exclude-components="settings.excludeComponents"
        :exclude-properties="settings.excludeProperties"
        :shouldOpenTab="true"
        :valueDisplayLimit=1
        :encodingLevel="focusData.meta.encodingLevel">
      </EntitySummary>
    </div>
  </li>
</template>


<style lang="scss">

.PanelSearch {

  &-listItem {

    .EntitySummary-detailsKey {
      @include media-breakpoint-up(sm) {
        flex-basis: 8em;
      }
    }

    &.is-added, 
    &.is-replaced {
      cursor: default;
    }

    code {
      color: $black;
    }

    .label {
      color: $black;
      font-weight: bold;
      font-size: 16px;
      display: inline-block;
      width: 74%;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .type {
      width: 24%;
      display: inline-block;
      text-align: right;
    }

    &:nth-child(even) {
      background-color: darken($neutral-color, 2%);
    }

    &.is-selected {
    } 

    & .EntitySummary {
      padding: 0;

      & .EntitySummary-title {
        font-size: 18px;
        font-size: 1.8rem;
        font-weight: 600;
      }
    }
  }

  &-action {    
    display: flex;
    flex-direction: column;
  }

  &-linkCount {
    border: 2px solid $brand-primary;
    width: 100%;
    text-align: center;
    margin-top: -4px;
    border-radius: 0 0 4px 4px;
    border-top-width: 4px;
    color: $grey;
    font-weight: 600;
    font-size: 1.3rem;

    &.has-links {
      color: $brand-primary;
    }

    .PanelComponent-listItem.is-added &,
    .PanelComponent-listItem.is-replaced & {
      border-color: $grey-lighter;
    }
  }

  &-itemContainer {
    width: 100%;
    overflow: hidden;

    &.has-action {
      border: solid $grey-lighter-transparent;
      border-width: 0px 0px 0px 1px;
      padding: 0 15px;
      margin-left: 15px;
    }
  }
}

</style>
