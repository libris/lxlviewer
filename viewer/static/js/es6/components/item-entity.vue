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
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
    }
  },
  data: function() {
    return {
      inEdit: false,
      showCardInfo: false,
      searchResult: {},
      searchDelay: 2,
      formObj: {},
    }
  },
  computed: {
    // TODO: Refactor computed
    json() {
      return JSON.stringify(this.item);
    },
    linkedItem() {
      return EditUtil.getLinked(this.item['@id'], this.editorData.linked);
    },
    getChip() {
      const chip = DisplayUtil.getChip(this.linkedItem, this.display, this.editorData.linked, this.vocab, this.settings.vocabPfx);
      return chip;
    },
    getCard() {
      const card = DisplayUtil.getCard(this.linkedItem, this.display, this.editorData.linked, this.vocab, this.settings.vocabPfx);
      return card;
    },
    embedded() {
      return this.isEmbedded(this.item['@type']);
    },
    getRange() {
      const types = VocabUtil.getRange(this.key, this.vocab, this.settings.vocabPfx);
      return types;
    },
  },
  ready: function() {
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
      return (isObject(v) || k === '@id');
    },
    removeThis() {
      console.log("Removethis called");
      const holder = this.$parent.value;
      if (_.isArray(holder)) {
        this.$parent.removeById(this.item['@id']);
      } else if (_.isPlainObject(holder)) {
        this.$parent.removeKey(this.key);
      } else {
        this.$parent.emptyValue();
      }
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
    <div class="entity-chip">
      <span class="chip-label" @mouseenter="showCardInfo=true" @mouseleave="showCardInfo=false">
        <span v-for="(k,v) in getChip">
          <span v-if="!isObject(v) && k !== '@id'">{{ v }}</span>
          <span v-if="!(!isObject(v) && k !== '@id') && size(getChip) === 1">{{ v | json | removeDomain }}</span>
        </span>
      </span>
      <i class="chip-action fa fa-times" v-on:click="removeThis" v-if="!isLocked"></i>
    </div>
    <div class="card-info-container" v-show="showCardInfo">
      <div class="card-info" v-bind:class="{ 'linked': isLinked}">
        <ul>
          <li v-for="(k,v) in getCard">
            <span v-if="k === '@type'"><strong>{{v | labelByLang | capitalize }}</strong></span>
            <span v-if="k !== '@type' && !isObject(v)">{{ k | labelByLang | capitalize }}: {{v}}</span>
            <span v-if="k !== '@type' && isObject(v)">{{ k | labelByLang | capitalize }}:
              <span v-for="(x,y) in v">{{y}}, </span>
            </span>
          </li>
        </ul>
      </div>
    </div>

  </div>
</template>

<style lang="less">
@import '../../../less/main_libris.less';
// Variables
@chipColor: @gray-lighter;
@chipColorLinked: @gray-dark;
@chipTextColor: darken(@chipColorLinked, 60%);
@chipTextColorLinked: lighten(@chipColor, 80%);

.entity-container {
  .chip-action {
    cursor: pointer;
  }

  .card-info-container {
    position: absolute;
    .card-info {
      background-color: @chipColor;
      color: chipTextColor;
      max-width: 500px;
      box-shadow: inset -2px -2px darken(@chipColor, 10%);
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
      border-top-right-radius: 10px;
      position: relative;
      left: 5%;
      top: -8px;
      padding: 10px;
      &.linked {
        background-color: @chipColorLinked;
        color: @chipTextColorLinked;
        box-shadow: inset -2px -2px darken(@chipColorLinked, 10%);
      }
      ul {
        list-style: none;
        padding: 0px;
        li {
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
    padding: 0px 0.2em 0px 0.5em;
    margin: 0px 0.5em 0.5em 0px;
    border-radius: 1em;
    color: @chipTextColor;
    background-color: @chipColor;
    border: 0px;
    box-shadow: inset 0px -2px darken(@chipColor, 10%);
    &.locked {
      padding-right: 0.5em;
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
      color: fadeout(@chipTextColor,20%);
      &:hover {
        color: @chipTextColor;
      }
    }
    &.linked {
      background-color: @chipColorLinked;
      box-shadow: inset 0px -2px darken(@chipColorLinked, 10%);
      color: @chipTextColorLinked;
      i {
        color:@chipTextColorLinked;;
      }
    }
  }
}

</style>
