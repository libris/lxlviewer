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
  <div class="item-entity-container">
    <div class="item-entity" v-bind:class="{'expanded': expanded}">
      <div class="topbar">
        <i class="fa fa-chevron-right" :class="{'down': expanded}" @click="toggleExpanded()"></i>
        <span class="type" @click="toggleExpanded()" title="{{ focusData['@type'] }}" v-if="!expanded">{{ focusData['@type'] | labelByLang | capitalize }}</span>
        <span class="collapsed-label" @click="toggleExpanded()"><span v-if="!expanded">{{getItemLabel}}</span><span class="placeholder">.</span></span>
        <span class="actions" v-if="!isLocked">
          <i v-if="!isLocked" class="fa fa-trash-o chip-action" :class="{'show-icon': showActionButtons}" v-on:click="removeThis(true)" @mouseover="removeHover = true" @mouseout="removeHover = false"></i>
        </span>
      </div>
      <entity-summary v-if="expanded" :focus-data="focusData" :is-extractable="false" :add-link="true" :lines="5" :actions="false" :is-local="false"></entity-summary>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

@linked-color: #c2d2d0;

.item-entity-container {
  margin: 0px 0px 5px 0px;
  .item-entity {
    &.expanded {
      margin: 0 0 2em 0;
    }
    transition: all 0.5s ease;
    width: 100%;
    border: solid @linked-color;
    border-bottom-color: darken(@linked-color, 10%);
    background-color: #fdfdfd;
    border-radius: 10px;
    border-width: 0px 1px 3px 1px;
    overflow: hidden;
    line-height: 1.6;
    > .topbar {
      display: flex;
      align-items: center;
      padding: 5px;
      background-color: @linked-color;
      white-space: nowrap;
      overflow: hidden;
      cursor: pointer;
      > .actions {
        display: flex;
        flex-basis: 4em;
        flex-direction: row-reverse;
        .confirm-remove-box {
          transform: translate(16px, 0px);
        }
      }
      > i, > span > i {
        transition: all 0.2s ease;
        padding: 0 0.5em;
        cursor: pointer;
        &.down {
          transform:rotate(90deg);
        }
        &::before {
          vertical-align: sub;
        }
      }
      .chip-action {
        cursor: pointer;
      }
      .collapsed-label {
        cursor: pointer;
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
          padding-left: 1em;
          height: 1.6em;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
      .type {
        // text-transform: uppercase;
        font-weight: bold;
        font-size: 85%;
        a {
          text-decoration: none;
          cursor: help;
          color: @black;
        }
      }
    }
  }
}

</style>
