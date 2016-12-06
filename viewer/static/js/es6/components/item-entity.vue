<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as EditUtil from '../utils/edit';
import ProcessedLabel from './processedlabel';
import { getVocabulary, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'item-entity',
  props: {
    item: {},
    key: '',
    index: Number,
    isLocked: false,
    focus: '',
    status: {},
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
      showCardInfo: false,
      searchResult: {},
      searchDelay: 2,
      formObj: {},
    };
  },
  computed: {
    // TODO: Refactor computed
    json() {
      return JSON.stringify(this.item);
    },
    linkedItem() {
      if (_.isArray(this.item) || !_.isObject(this.item)) {
        throw new Error('Item is not an object.');
      }
      return EditUtil.getLinked(
        this.item['@id'],
        this.editorData.linked
      );
    },
    getChip() {
      const chip = DisplayUtil.getChip(
        this.linkedItem,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings.vocabPfx
      );
      return chip;
    },
    getCard() {
      const card = DisplayUtil.getCard(
        this.linkedItem,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings.vocabPfx
      );
      return card;
    },
    embedded() {
      return this.isEmbedded(this.item['@type']);
    },
    getRange() {
      const types = VocabUtil.getRange(
        this.key,
        this.vocab,
        this.settings.vocabPfx
      );
      return types;
    },
    isWork() {
      return this.focus === 'work';
    },
    isInstance() {
      return this.focus === 'it';
    },
  },
  ready() {
  },
  methods: {
    isEmpty() {
      // TODO: Is the item empty?
      return false;
    },
    isObject(obj) {
      return _.isObject(obj);
    },
    size(obj) {
      return _.size(obj);
    },
    isPretty(key, value) {
      return (this.isObject(value) || key === '@id');
    },
    removeThis() {
      this.$dispatch('remove-item', this.item);
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
  },
};
</script>

<template>
  <div class="entity-container">
    <div class="entity-chip" :class="{ 'locked': isLocked, 'work-state': isWork, 'instance-state': isInstance}">
      <span class="chip-label" @mouseenter="showCardInfo=true" @mouseleave="showCardInfo=false">
      <i class="fa fa-link" aria-hidden="true"></i>
        {{getChip}}
      </span>
      <i class="chip-action fa fa-times" v-on:click="removeThis" v-if="!isLocked"></i>
    </div>
    <div class="card-info-container" v-show="showCardInfo">
      <div class="card-info" :class="{ 'locked': isLocked, 'work-state': isWork, 'instance-state': isInstance }">
        <ul>
          <li v-for="(k,v) in getCard" track-by="$index">
            <span v-if="k === '@type'"><strong>{{v | labelByLang | capitalize }}</strong></span>
            <span v-if="k !== '@type' && !isObject(v)">{{ k | labelByLang | capitalize }}: {{v | json}}</span>
            <span v-if="k !== '@type' && isObject(v)">{{ k | labelByLang | capitalize }}:
              <span v-for="(x,y) in v" track-by="$index">
                {{y}}
              </span>
            </span>
          </li>
        </ul>
      </div>
    </div>

  </div>
</template>

<style lang="less">
@import './variables.less';


.entity-container {

  .chip-action {
    cursor: pointer;
  }

  .card-info-container {
    position: absolute;
    .card-info {
      &.instance-state {
        background-color: @instance-chip-background;
        color: @instance-chip-text;
      }
      &.work-state {
        background-color: @work-chip-background;
        color: @work-chip-text;
      }
      max-width: 500px;
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
      border-top-right-radius: 10px;
      position: relative;
      left: 5%;
      top: -8px;
      padding: 10px;
      ul {
        list-style: none;
        padding: 0px;
        li {
          display: inline-block;
          span {
            word-break: break-word;
          }
        }
      }
    }
  }
  vertical-align: middle;
  display: inline-block;
  &.block {
    display: block;
  }
  &.structured {
    width: 100%;
  }
  .entity-chip {
    height: 1.7em;
    padding: 0px 0.5em 0px 0.5em;
    margin: 0.25em;
    border-radius: 1em;
    border: 0px;
    &.instance-state {
      color: @instance-chip-text;
      background-color: @instance-chip-background;
      box-shadow: inset -2px -2px darken(@instance-chip-background, 10%);
    }
    &.work-state {
      color: @work-chip-text;
      background-color: @work-chip-background;
      box-shadow: inset -2px -2px darken(@work-chip-background, 10%);
    }
    &.locked {
      padding-right: 1em;
    }
    .chip-label {
      float: left;
      display: inline-block;
      max-width: 230px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chip-action {
      float: left;
      padding: 0.25em;
      margin-right: -0.3em;
      &:hover {
        color: darken(@instance-chip-background, 50%);
      }
    }
  }
}

</style>
