<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as vocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as EditUtil from '../utils/edit';
import ProcessedLabel from './processedlabel';
import { getVocabulary, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'entity',
  props: {
    item: {},
    key: '',
    index: Number,
    isLocked: false,
  },
  vuex: {
    getters: {
      editorData: getEditorData,
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
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
    getChip() {
      const chip = DisplayUtil.getChip(this.item, this.display, this.editorData.linked, this.vocab, this.settings.vocabPfx);
      return chip;
    },
    getCard() {
      const card = DisplayUtil.getCard(this.item, this.display, this.editorData.linked, this.vocab, this.settings.vocabPfx);
      return card;
    },
    isLinked() {
      // Is @id present?
      if (typeof this.item !== 'undefined' && this.item['@id']) {
        return true;
      } else {
        return false;
      }
    },
    isTyped() {
      // Is @type present?
      if (typeof this.item !== 'undefined' && this.item['@type']) {
        return true;
      } else {
        return false;
      }
    },
    embedded() {
      return this.isEmbedded(this.item['@type']);
    },
    getRange() {
      const types = vocabUtil.getRange(this.key, this.vocab, this.settings.vocabPfx);
      return types;
    },
    cardInfoList() {
      const cardInfo = DisplayUtil.getCard(this.item, this.display, this.editorData.linked, this.vocab, this.settings.vocabPfx);
      let result = [];
      if (_.isString(cardInfo)) {
        result.push(cardInfo);
      } else {
        _.each(cardInfo, function(content) {
          if (_.isObject(content)) {
            _.each(content, function(content){
              result.push(content);
            })
          } else {
            result.push(content);
          }
        })
      }
      return result;
    },
  },
  ready: function() {
    this.$nextTick(function() {
      // If range of field is only 1, set it automatically
      if (!this.item['@type'] && !this.item['@id']) {
        const range = this.getRange;
        if (range.length === 1) {
          this.setNewObject(range[0]);
        }
      }
    });
  },
  methods: {
    setLinkedItem(item) {
      const newItem = {};
      newItem['@id'] = item['@id'];
      this.inEdit = false;
      this.$dispatch('add-linked', item);
      this.$dispatch('update-entity', this.index, newItem);
    },
    search(keyword) {
      console.log(keyword);
      const self = this;
      self.loading = true;
      this.getItems(keyword).then((result) => {
        self.searchResult = result;
      });
    },
    getItems(searchkey) {
      // TODO: Support asking for more items

      const searchUrl = `/find.json?q=${searchkey}&@type=${this.item['@type']}&limit=10`;
      // console.log(searchUrl);
      return new Promise((resolve, reject) => {
        httpUtil.get({url:searchUrl, accept:'application/ld+json'}).then((response) => {
          resolve(response.items);
        }, (error) => {
          reject('Error searching...', error);
        });
      });
    },
    expand() {
      // Show form
      this.inEdit = true;
    },
    collapse() {
      // Hide form

      this.inEdit = false;
      this.save();
    },
    save() {
      this.$dispatch('update-entity', this.index, this.item);
    },
    isEmpty() {
      // TODO: Is the item empty?
      return false;
    },
    isEmbedded(type) {
      if (typeof type === 'undefined') {
        return false;
      }

      // Is the type of the item derived from StructuredValue?
      const embeddedTypes = ['StructuredValue', 'ProvisionActivity', 'Contribution'];
      const typeChain = vocabUtil.getBaseClasses(type, this.vocab, this.settings.vocabPfx);
      if (typeChain.length > 0) {
        for (let i = 0; i < embeddedTypes.length; i++) {
          if (~typeChain.indexOf(`${this.settings.vocabPfx}${embeddedTypes[i]}`)) {
            return true;
          }
        }
      }
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
    setNewObject(type) {
      // Sets the focused object (this.item) to an object of the type specified.
      // Also adds all available properties.
      const newObj = this.item;
      this.inEdit = true;
      const pfx = this.settings.vocabPfx;
      newObj['@type'] = type;

      let properties = [];
      if (this.isEmbedded(type)) {
        properties = vocabUtil.getProperties(type, this.vocab, this.settings.vocabPfx);
      } else {
        properties = DisplayUtil.getProperties(type, 'cards', this.display);
      }
      if (properties.length === 0) {
        properties.push('search');
      }

      for (let i = 0; i < properties.length; i++) {
        newObj[properties[i]] = '';
      }
      this.item = Object.assign({}, this.item, newObj);
      this.expand();
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
  <div class="entity-container" v-bind:class="{'block': inEdit}">
    <div class="entity-chip" v-if="(!embedded && isTyped && !inEdit) || isLinked" v-bind:class="{ 'linked': isLinked, 'locked': isLocked }">
      <span class="chip-label" @mouseenter="showCardInfo=true" @mouseleave="showCardInfo=false">
        <span v-if="isObject(getChip)">
          <span v-for="(k,v) in getChip" v-if="!isObject(v)" track-by="$index">
            {{v}}
          </span>
        </span>
        <span v-if="!isObject(getChip)">
          {{getChip}}
        </span>
      </span>
      <i class="chip-action fa fa-pencil" v-on:click="expand" v-if="!isLocked && !isLinked"></i>
      <i class="chip-action fa fa-times" v-on:click="removeThis" v-if="!isLocked && isLinked"></i>
    </div>
    <div class="card-info-container" v-if="showCardInfo">
      <div class="card-info" v-bind:class="{ 'linked': isLinked}">
        <ul>
          <li v-for="i in cardInfoList">
            {{i}}
          </li>
        </ul>
      </div>
    </div>
    <div class="entity-form" v-if="!isTyped && !isLinked">
      <button v-for="type in getRange" v-on:click="setNewObject(type)">{{type}}</button>
    </div>

    <div class="entity-form" v-show="inEdit">
      <strong>{{item['@type'] | labelByLang | capitalize}}</strong>
      <div class="entity-form-row" v-for="(k,v) in item">
        <span class="entity-form-label">{{k | labelByLang | capitalize}}</span>
        <input v-model="v" v-on:change="search(v)"></input>
      </div>
      <div class="match-indicator" v-if="searchResult.length > 0">
        Det finns {{ searchResult.length }} entiteter som matchar denna.
      </div>
      <div class="search-result" v-if="searchResult.length > 0">
        <div class="search-result-item" v-for="item in searchResult" track-by="$index" v-on:click="setLinkedItem(item)">
          {{ item.prefLabelByLang[settings.lang] }}
        </div>
      </div>
      <button v-on:click="removeThis"><i class="chip-action fa fa-trash"></i> Ta bort</button>
      <button v-on:click="collapse"><i class="chip-action fa fa-check"></i> Klar</button>
    </div>

    <div class="entity-structured" v-if="embedded && !inEdit">
     <i class="chip-action fa fa-times" v-on:click="removeThis"></i>
      <ul>
        <li v-for="(k,v) in item" v-if="k.indexOf('@') == -1">{{k}}: {{v}} </li>
      </ul>

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
      cursor: pointer;
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
    border-radius: 1em;
    padding: 5px;
    overflow: hidden;
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
  }
  &.expanded {
    width: 100%;
    .entity-chip {
    }
    .entity-form {
    }
  }

  .entity-structured {
    ul {
      padding: 0px;
      list-style: none;
    }
    margin: 5px;
    padding: 10px;
    border: 1px dashed @gray;
    .chip-action {
      float: right;
    }
  }
}

</style>
