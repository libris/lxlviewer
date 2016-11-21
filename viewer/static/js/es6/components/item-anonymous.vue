<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as EditUtil from '../utils/edit';
import ProcessedLabel from './processedlabel';
import { getVocabulary, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'item-anonymous',
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
    }
  },
  computed: {
    // TODO: Refactor computed
    json() {
      return JSON.stringify(this.item);
    },
    formObj() {
      return getForm(this.item);
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
    getForm(item) {
      const formObj = {};
      if (!item['@type']) {
        return formObj;
      }
      let inputKeys = DisplayUtil.getProperties(item['@type'], 'cards', this.display);
      if (inputKeys.length === 0) {
        const baseClasses = vocabUtil.getBaseClassesFromArray(item['@type'], this.vocab, this.settings.vocabPfx);
        for (let i = 0; i < baseClasses.length; i++) {
          inputKeys = DisplayUtil.getProperties(baseClasses[i].replace(this.settings.vocabPfx, ''), 'cards', this.display);
          if (inputKeys.length > 0) {
            break;
          }
        }
      }
      inputKeys = ['@type'].concat(inputKeys);
      for (let i = 0; i < inputKeys.length; i++) {
        if (item[inputKeys[i]]) {
          formObj[inputKeys[i]] = item[inputKeys[i]];
        } else {
          formObj[inputKeys[i]] = '';
        }
      }
      return formObj;
    },
    isEmpty() {
      // TODO: Is the item empty?
      return false;
    },
    isObject(obj) {
      return _.isObject(obj);
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
  <div>
    <strong>{{ item['@type'] }}</strong>
    <span v-for="(k,v) in getForm" v-if="k !== '@type'">
    {{k}} <input v-model="v"></input>
    </span>
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
  .entity-form {
    border: 0px solid;
    background-color: darken(@chipColor, 5%);
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
  &.expanded {
    width: 100%;
    .entity-chip {
    }
    .entity-form {
    }
  }

}

</style>
