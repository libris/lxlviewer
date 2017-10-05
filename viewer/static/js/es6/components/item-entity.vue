<script>
import * as _ from 'lodash';
import * as VocabUtil from '../utils/vocab';
import * as DataUtil from '../utils/data';
import CardComponent from './card-component';
import EntitySummary from './entity-summary';
import ProcessedLabel from './processedlabel';
import ItemMixin from './mixins/item-mixin';
import LensMixin from './mixins/lens-mixin';
import { getVocabulary, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'item-entity',
  mixins: [ItemMixin, LensMixin],
  props: {
    item: {},
    key: '',
    index: Number,
    isLocked: false,
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
    },
  },
  data() {
    return {
      inEdit: false,
      searchResult: {},
      searchDelay: 2,
      formObj: {},
      expanded: false,
      showCardInfo: false,
    };
  },
  computed: {
    getRange() {
      const types = VocabUtil.getRange(
        this.key,
        this.vocab,
        this.settings.vocabPfx
      );
      return types;
    },
  },
  ready() {
  },
  methods: {
    expand() {
      this.expanded = true;
    },
    collapse() {
      this.expanded = false;
    },
    toggleExpanded() {
      if (this.expanded === true) {
        this.collapse();
      } else {
        this.expand();
      }
    },
    isEmpty() {
      // TODO: Is the item empty?
      return false;
    },
    size(obj) {
      return _.size(obj);
    },
    isPretty(key, value) {
      return (this.isObject(value) || key === '@id');
    },
    addFocus() {
      this.focused = true;
    },
    removeFocus() {
      this.focused = false;
    },
  },
  components: {
    'processed-label': ProcessedLabel,
    'card-component': CardComponent,
    'entity-summary': EntitySummary,
  },
};
</script>

<template>
  <div class="item-entity-container" @mouseleave="showCardInfo=false">
    <div class="item-entity" v-if="!expanded" :class="{ 'locked': isLocked, 'highlighted': showCardInfo }" @mouseenter="showCardInfo=true">
      <div class="topbar">
        <i class="linked-indicator fa fa-chain"></i>
        <span class="collapsed-label"><span v-if="!expanded">{{getItemLabel}}</span><span class="placeholder">.</span></span>
        <span class="actions" v-if="!isLocked">
          <i v-if="!isLocked" class="fa fa-trash-o chip-action" :class="{'show-icon': showActionButtons}" v-on:click="removeThis(true)" @mouseover="removeHover = true" @mouseout="removeHover = false"></i>
        </span>
      </div>
    </div>
    <card-component :title="getItemLabel" :focus-data="item" :uri="item['@id']" :is-local="false" :is-locked="isLocked" :should-show="showCardInfo" :floating="!expanded" :key="key"></card-component>
  </div>
</template>

<style lang="less">
@import './_variables.less';

@linked-color: #daefec;

.item-entity-container {
  margin: 0px 0px 5px 0px;
  .item-entity {
    &.expanded {
      margin: 0 0 2em 0;
    }
    transition: all 0.5s ease;
    width: 100%;
    border: none;
    box-shadow: @shadow-chip;
    background-color: #fdfdfd;
    overflow: hidden;
    line-height: 1.6;
    > .topbar {
      padding: 5px;
      display: flex;
      align-items: center;
      background-color: @white;
      border: 1px solid rgba(0, 0, 0, 0.15);
      box-shadow: inset 2.1em 0px 0px 0px @gray-darker;
      white-space: nowrap;
      overflow: hidden;
      > .linked-indicator {
        color: @white;
        margin-right: 1em;
        margin-left: 0.25em;
      }
      > .actions {
        display: flex;
        flex-basis: 4em;
        flex-direction: row-reverse;
        .confirm-remove-box {
          transform: translate(16px, 0px);
        }
      }
      > i.fa-chain {

      }
      .chip-action {
        cursor: pointer;
      }
      .collapsed-label {
        flex-grow: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        .placeholder {
          visibility: hidden;
        }
        > span {
          height: 1.6em;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
  }
}

</style>
