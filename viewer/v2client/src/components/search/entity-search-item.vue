<script>
import * as _ from 'lodash';
import LensMixin from '../mixins/lens-mixin';
import EntitySummary from '../shared/entity-summary';
import SummaryAction from '../inspector/summary-action';
import { mapGetters } from 'vuex';

export default {
  name: 'entity-search-item',
  mixins: [LensMixin],
  props: {
    focusData: {},
    disabledIds: {
      type: Array,
      default: () => [],
    },
    path: '',
  },
  data() {
    return {
      keyword: '',
      listItemSettings: {
        text: 'Add',
        styling: 'brand',
        event: 'add-entity',
        show: (this.disabledIds.indexOf(this.focusData['@id']) === -1),
        inspectAction: true,
        path: this.path,
      },
    }
  },
  methods: {
    addItem() {
      this.$emit('add-item');
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
      const updatedListItemSettings = _.merge({payload: this.focusData}, _.cloneDeep(this.listItemSettings));
      return updatedListItemSettings;
    },
  },
  components: {
    'entity-summary': EntitySummary,
    'summary-action': SummaryAction,
  },
  watch: {
  },
  events: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
  },
};
</script>

<template>
  <li class="EntitySearch-listItem" :class="{ 'already-added' : !listItemSettings.show }" >
    <summary-action 
      :disabled="!listItemSettings.show" 
      :options="addPayload" 
      @action="addItem()">
    </summary-action>
    <div class="EntitySearch-itemContainer">
      <entity-summary 
        :focus-data="focusData" 
        :should-link="false" 
        :lines="4">
      </entity-summary>
    </div>
  </li>
</template>


<style lang="less">

.EntitySearch{

  &-listItem {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 15px;
    background-color: @list-item-bg-even;
    transition: background-color 0.2s ease;

    &:nth-child(odd) {
      background-color: @list-item-bg-odd;
    }
    &:hover:not(.already-added) {
      background-color: @list-item-bg-hover;
    }

    code {
      color: @black;
    }

    &.already-added {
      & .EntitySearch-itemContainer {
        opacity: 0.5;
        cursor: default;
      }
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
      // outline: solid 1px @brand-primary;
      // background-color: fadeout(@brand-primary, 70%);
    } 

    & .EntitySummary {
      padding: 0;

      & .EntitySummary-title {
        font-size: 16px;
        font-size: 1.6rem;
        font-weight: 600;
      }
    }
  }

  &-itemContainer {
    padding: 0 15px;
    width: 100%;
    overflow: hidden;
  }
}

</style>
