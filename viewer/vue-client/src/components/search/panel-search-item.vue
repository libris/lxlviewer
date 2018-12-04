<script>
import * as _ from 'lodash';
import { mapGetters } from 'vuex';
import LensMixin from '../mixins/lens-mixin';
import EntitySummary from '../shared/entity-summary';
import SummaryAction from '../inspector/summary-action';

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
    icon: null,
    text: {
      type: String,
      default: '',
    },
    hasAction: false,
    path: {
      type: String,
      default: '',
    },
    isReplaced: false,
    isCompact: false,
  },
  data() {
    return {
      keyword: '',
      listItemSettings: {
        text: this.text,
        styling: 'brand',
        inspectAction: true,
        path: this.path,
        icon: this.icon,
      },
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
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    addPayload() {
      const updatedListItemSettings = _.merge({ payload: this.focusData }, _.cloneDeep(this.listItemSettings));
      return updatedListItemSettings;
    },
  },
  components: {
    'entity-summary': EntitySummary,
    'summary-action': SummaryAction,
  },
  mounted() { 
  },
};
</script>

<template>
  <li class="PanelSearch-listItem PanelComponent-listItem"
    :class="{ 'is-added' : isDisabled, 'is-replaced' : isReplaced }">
    <summary-action 
      :disabled="isDisabled" 
      :replaced="isReplaced"
      :options="addPayload" 
      @action="useItem()"
      v-if="hasAction">
    </summary-action>
    <div class="PanelSearch-itemContainer" 
      :class="{'has-action' : hasAction}">
      <entity-summary 
        :focus-data="focusData" 
        :should-link="true" 
        :is-compact="isCompact"
        :shouldOpenTab="true"
        :valueDisplayLimit=1>
      </entity-summary>
    </div>
  </li>
</template>


<style lang="less">

.PanelSearch{

  &-listItem {

    &.is-added, 
    &.is-replaced {
      cursor: default;
    }

    code {
      color: @black;
    }

    .label {
      color: @black;
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
      background-color: darken(@neutral-color, 2%);
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

  &-itemContainer {
    width: 100%;
    overflow: hidden;

    &.has-action {
      border: solid @gray-lighter-transparent;
      border-width: 0px 0px 0px 1px;
      padding: 0 15px;
      margin-left: 15px;
    }
  }
}

</style>
