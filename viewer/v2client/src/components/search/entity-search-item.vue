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
  <li class="EntitySearch-listItem PanelComponent-listItem" :class="{ 'already-added' : !listItemSettings.show }" >
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

    &.already-added {
      & .EntitySearch-itemContainer {
        opacity: 0.6;
        cursor: default;
      }
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
