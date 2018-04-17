<script>
import * as _ from 'lodash';
import LensMixin from '../mixins/lens-mixin';
import EntitySummary from '../shared/entity-summary';
import SummaryActionButton from '../inspector/summary-action-button';
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
      let currentValue = _.get(this.inspector.data, this.path);
      const obj = { '@id': this.focusData['@id'] };
      if (!_.isArray(currentValue)) {
        currentValue = [currentValue];
      }
      currentValue.push(obj);
      this.$store.dispatch('addToQuoted', this.focusData);
      this.$store.dispatch('updateInspectorData', {
          path: `${this.path}`,
          value: currentValue,
          addToHistory: true,
      });
      this.$store.dispatch('pushInspectorEvent', { 
        name: 'modal-control', 
        value: 'close-entity-adder'
      });
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
    'summary-action-button': SummaryActionButton,
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
  <li class="search-result-item" >
    <div class="search-item-entity-summary-container">
      <entity-summary :focus-data="focusData" :should-link="false" :lines="4"></entity-summary>
    </div>
    <summary-action-button v-show="listItemSettings.show" :settings="addPayload" @action="addItem()"></summary-action-button>
  </li>
</template>


<style lang="less">

.search-result-item {
  .search-item-entity-summary-container {
    max-width: 85%;
  }
  border: solid #777;
  margin: 4px;
  border-width: 1px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  code {
    color: @black;
  }
  &.already-added {
    opacity: 0.5;
    cursor: default;
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
    outline: solid 1px @brand-primary;
    background-color: fadeout(@brand-primary, 70%);
  } 
}

</style>
