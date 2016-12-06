<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import ProcessedLabel from './processedlabel';
import ItemEntity from './item-entity';
import { getVocabulary, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'item-anonymous',
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
    };
  },
  computed: {
    filteredItem() {
      const filteredItem = Object.assign({}, this.item);
      delete filteredItem['@type'];
      return filteredItem;
    },
    // TODO: Refactor computed
    json() {
      return JSON.stringify(this.item);
    },
    formObj() {
      return this.getForm(this.item);
    },
    getChip() {
      const chip = DisplayUtil.getChip(
        this.formObj,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings.vocabPfx
      );
      return chip;
    },
    getRange() {
      const types = VocabUtil.getRange(
        this.key,
        this.vocab,
        this.settings.vocabPfx
      );
      return types;
    },
    isEmpty() {
      let bEmpty = true;
      // Check if item has any keys besides @type. If not, we'll consider it empty.
      _.each(this.item, (value, key) => {
        if (key !== '@type') {
          if (value && value !== '') {
            bEmpty = false;
          }
        }
      });
      return bEmpty;
    },
    isWork() {
      return this.focus === 'work';
    },
    isInstance() {
      return this.focus === 'it';
    },
  },
  ready() {
    this.$nextTick(() => {
      if (this.isEmpty) {
        this.openForm();
      }
    });
  },
  methods: {
    getForm(item) {
      const formObj = {};
      if (!item['@type']) {
        return formObj;
      }
      let inputKeys = DisplayUtil.getProperties(
        item['@type'],
        'cards',
        this.display
      );
      if (inputKeys.length === 0) {
        const baseClasses = VocabUtil.getBaseClassesFromArray(
          item['@type'],
          this.vocab,
          this.settings.vocabPfx
        );
        for (const className of baseClasses) {
          inputKeys = DisplayUtil.getProperties(
            className.replace(this.settings.vocabPfx, ''),
            'cards',
            this.display
          );
          if (inputKeys.length > 0) {
            break;
          }
        }
      }
      inputKeys = ['@type'].concat(inputKeys);
      for (const key of inputKeys) {
        if (item[key]) {
          formObj[key] = item[key];
        } else {
          formObj[key] = '';
        }
      }
      return formObj;
    },
    openForm() {
      this.inEdit = true;
    },
    closeForm() {
      this.inEdit = false;
    },
    isObject(obj) {
      return _.isObject(obj);
    },
    removeThis() {
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
    'item-entity': ItemEntity,
  },
};
</script>

<template>
  <div class="item-anonymous" v-bind:class="{'expanded': inEdit, 'collapsed': !inEdit, 'locked': isLocked, 'work-state': isWork, 'instance-state': isInstance }">
    <div v-show="!inEdit">
      <span class="chip-label" @mouseenter="showCardInfo=true" @mouseleave="showCardInfo=false">
        {{getChip}}
      </span>
      <i class="chip-action fa fa-pencil" v-on:click="openForm" v-if="!isLocked"></i>
    </div>
    <div v-show="inEdit">
      <i class="fa fa-times chip-action" v-on:click="removeThis"></i>
      <strong>{{ item['@type'] | labelByLang | capitalize }}</strong>
      <span v-for="(k,v) in filteredItem">
        <span class="item-label">{{k | labelByLang | capitalize }}:</span>
        <input v-model="v" v-if="!isObject(v)"></input>
        <item-entity :focus="focus" :key="k" :item="v" v-if="isObject(v)"></item-entity>
      </span>
      <div class="actions">
        <button v-on:click="closeForm" v-bind:disabled="isEmpty">Klar</button>
      </div>
    </div>
    <div class="card-info-container" v-show="showCardInfo">
      <div class="card-info" :class="{ 'locked': isLocked, 'work-state': isWork, 'instance-state': isInstance }">
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
@import './variables.less';

.item-anonymous {
  background-color: @gray-lighter;
  margin: 0px 0px 3px 3px;
  transition: 1s ease;
  transition-property: width, box-shadow;
  &.instance-state {
    background-color: @instance-chip-background;
    color: @instance-chip-text;
    box-shadow: inset -2px -2px darken(@instance-chip-background, 10%);
  }
  &.work-state {
    background-color: @work-chip-background;
    color: @work-chip-text;
    box-shadow: inset -2px -2px darken(@work-chip-background, 10%);
  }
  .item-label {
    display: block;
  }
  &.collapsed {
    height: 1.7em;
    padding: 0px 0.2em 0px 0.5em;
    margin: 0.25em;
    border-radius: 1em;
    &.locked {
      padding-right: 1em;
    }
    border: 0px;
    .chip-action {
      float: right;
      padding: 0.25em;
      color: fadeout(@instance-chip-text,20%);
      &:hover {
        color: @instance-chip-text;
      }
    }
  }
  &.expanded {
    width: 100%;
    margin: 0px 0px 1em 0px;
    border-radius: 5px;
    padding: 10px;
    box-shadow: 0px 2px 3px 1px rgba(0, 0, 0, 0.2);
    .actions {
      text-align: right;
    }
    .entity-chip {
    }
    .entity-form {
    }
  }

  strong {
    display: block;
  }

  .chip-action {
    cursor: pointer;
    float: right;
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
  >.entity-chip {
    height: 1.7em;
    padding: 0px 0.2em 0px 0.5em;
    margin: 0px 0.5em 0.5em 0px;
    border-radius: 1em;
    color: @instance-chip-text;
    background-color: @instance-chip-background;
    border: 0px;
    box-shadow: inset 0px -2px darken(@instance-chip-background, 10%);
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
      float: right;
      padding: 0.25em;
      color: fadeout(@instance-chip-text,20%);
      &:hover {
        color: @instance-chip-text;
      }
    }
  }
  .entity-form {
    border: 0px solid;
    background-color: darken(@instance-chip-background, 5%);
    border-radius: 2px;
    padding: 5px;
    overflow: hidden;
    width: 100%;
    .entity-form-label {
      color: #000;
    }
    .search-result {
      background-color: @white;
      border: 1px solid @black;
      margin: 5px;
      padding: 3px;
      .search-result-item {
        border: 1px solid @black;
        min-height: 20px;
        &:hover {
          background-color: darken(@white, 5%);
        }
      }
    }
    .match-indicator {
      background-color: @white;
      border: 1px dashed @black;
      margin: 5px;
    }
    .entity-form-row {
      margin-bottom: 5px;
    }
  }

}

</style>
