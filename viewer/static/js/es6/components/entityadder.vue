<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as LayoutUtil from '../utils/layout';
import ProcessedLabel from './processedlabel';
import ToolTipComponent from './tooltip-component';
import EntitySearchList from './entity-search-list';
import LensMixin from './mixins/lens-mixin';
import { mixin as clickaway } from 'vue-clickaway';
import { changeStatus, changeNotification } from '../vuex/actions';
import { getVocabulary, getSettings, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  mixins: [clickaway, LensMixin],
  data() {
    return {
      searchOpen: false,
      searchResult: {},
      keyword: '',
      loading: false,
      debounceTimer: 500,
      chooseLocalType: false,
      showToolTip: false,
      rangeInfo: false,
      selectedType: '',
    };
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
    },
    actions: {
      changeStatus,
      changeNotification,
    },
  },
  props: {
    key: '',
    focus: '',
    allowLocal: true,
    propertyTypes: [],
    showActionButtons: false,
    active: false,
    isInner: false,
    isChip: false,
  },
  events: {
    'close-modals'() {
      this.closeSearch();
    },
    'add-entity'(item) {
      this.$dispatch('add-item', item);
      this.changeNotification('color', 'green');
      this.changeNotification('message', `Lade till "${this.getLabel(item)}"`);
      this.closeSearch();
    },
  },
  components: {
    'tooltip-component': ToolTipComponent,
    'entity-search-list': EntitySearchList,
  },
  watch: {
    keyword(value) {
      if (value) {
        setTimeout(() => {
          if (this.keyword === value) {
            this.search(value);
          }
        }, this.debounceTimer);
      } else {
        this.searchResult = {};
      }
    },
    active(value) {
      this.$dispatch('toggle-modal', value);
    }
  },
  computed: {
    getRange() {
      return VocabUtil.getRange(this.key, this.vocab, this.settings.vocabPfx);
    },
    getFullRange() {
      let types = [].concat(this.getRange);
      _.each(this.getRange, typeName => {
        const type = typeName.replace(this.settings.vocabPfx, '');
        const subClassArray = (VocabUtil.getSubClasses(type, this.vocab, this.settings.vocabPfx)).map(entry => {
          return entry['@id'];
        });
        types = types.concat(subClassArray);
      });
      return types;
    },
    searchTypes() {
      const types = this.getFullRange;
      const typeArray = [];
      for (const type of types) {
        typeArray.push(type.replace(this.settings.vocabPfx, ''));
      }
      return typeArray;
    },
    onlyEmbedded() {
      const range = this.getFullRange;
      for (const prop of range) {
        if (!VocabUtil.isEmbedded(prop, this.vocab, this.settings)) {
          return false;
        }
      }
      return true;
    },
    canRecieveObjects() {
      return (this.propertyTypes.indexOf('DatatypeProperty') === -1);
    },
    isLiteral() {
      // TODO: Verify usage
      if (this.getFullRange.length > 0) {
        for (const rangeElement of this.getFullRange) {
          if (rangeElement.indexOf('Literal') > -1) {
            return true;
          }
        }
      }
      return false;
    },
  },
  ready() {
    this.searchOpen = false;
  },
  methods: {
    add() {
      if (this.canRecieveObjects) {
        const range = this.getFullRange;
        if (range.length < 2 && this.onlyEmbedded) {
          this.addEmpty(range[0]);
        } else {
          this.show();
        }
      } else {
        this.$dispatch('add-item', '');
      }
    },
    show() {
      LayoutUtil.scrollLock(true);
      this.active = true;
      setTimeout(() => { // TODO: Solve this by setting focus after window has been rendered.
        document.getElementById('test').focus();
      }, 1);
      this.changeStatus('keybindState', 'entity-adder');
    },
    hide() {
      if (!this.active) return;
      this.active = false;
      LayoutUtil.scrollLock(false);
      this.changeStatus('keybindState', 'overview');
    },
    goLocal() {
      const range = this.getFullRange;
      if (range.length > 1) {
        this.chooseLocalType = true;
        const test = document.querySelector('#localTypePicker');
        test.focus();
      } else {
        this.addEmpty(range[0]);
      }
    },
    openSearch() {
      this.keyword = '';
      this.searchOpen = true;
    },
    closeSearch() {
      this.searchOpen = false;
      this.keyword = '';
      this.searchResult = {};
      this.chooseLocalType = false;
      this.hide();
    },
    addEmpty(type) {
      this.closeSearch();
      const obj = this.getEmptyForm(type);
      this.$dispatch('add-item', obj);
    },
    addType(label) {
      const vocabClass = VocabUtil.getClassFromLabel(label, this.settings.language, this.vocab, this.settings.vocabPfx);
      if (typeof vocabClass === 'undefined') {
        this.changeNotification('color', 'red');
        this.changeNotification('message', `Ogiltig typ: ${label}`);
      } else {
        this.addEmpty(vocabClass['@id']);
      }
    },
    search(keyword) {
      const self = this;
      self.searchResult = {};
      self.loading = true;
      this.getItems(keyword, this.searchTypes).then((result) => {
        setTimeout(() => {
          self.searchResult = result;
          self.loading = false;
        }, 500);
      }, (error) => {
        self.loading = false;
      });
    },
    getEmptyForm(type) {
      console.log('Type', type);
      const formObj = { '@type': type };
      let inputKeys = DisplayUtil.getProperties(type, 'cards', this.display, this.settings);
      if (inputKeys.length === 0) {
        const baseClasses = VocabUtil.getBaseClassesFromArray(
          type,
          this.vocab,
          this.settings.vocabPfx
        );
        console.log('baseClasses for', type, 'is', JSON.stringify(baseClasses));
        for (const baseClass of baseClasses) {
          inputKeys = DisplayUtil.getProperties(
            baseClass.replace(this.settings.vocabPfx, ''),
            'cards',
            this.display,
            this.settings
          );
          if (inputKeys.length > 0) {
            break;
          }
        }
        if (inputKeys.length === 0) {
          inputKeys = DisplayUtil.getProperties('Resource', 'cards', this.display, this.settings);
        }
        console.log(inputKeys);
      }
      inputKeys = ['@type'].concat(inputKeys);
      for (const inputKey of inputKeys) {
        if (inputKey === '@type') {
          formObj[inputKey] = type;
        } else {
          formObj[inputKey] = '';
        }
      }
      console.log('Form obj', JSON.stringify(formObj));
      return formObj;
    },
    getItems(keyword, typeArray) {
      // TODO: Support asking for more items
      const searchKey = `${keyword}*`;
      let searchUrl = `/find?q=${searchKey}`;
      if (typeof typeArray !== 'undefined' && typeArray.length > 0) {
        for (const type of typeArray) {
          searchUrl += `&@type=${type}`;
        }
      }
      searchUrl += '&_limit=40';
      // console.log(searchUrl);
      return new Promise((resolve, reject) => {
        httpUtil.get({ url: searchUrl, accept: 'application/ld+json' }).then((response) => {
          resolve(response.items);
        }, (error) => {
          reject('Error searching...', error);
        });
      });
    },
  },
};
</script>

<template>
<div class="entity-adder">
  <div v-if="isChip" class="chip action-button add-entity-button" :class="{ 'fade': !showActionButtons }" v-on:click="add()" @mouseenter="showToolTip=true" @mouseleave="showToolTip=false">
    <span class="chip-label"><i class="fa fa-fw fa-plus plus-icon" aria-hidden="true"></i><span class="label-text">{{ "Add" | translatePhrase }}</span></span>
  </div>
  <div v-if="!isChip" class="action-button add-entity-button" :class="{'disabled': active, 'fade': !showActionButtons }" v-on:click="add()" @mouseenter="showToolTip=true" @mouseleave="showToolTip=false">
    <span class="chip-label"><i class="fa fa-fw fa-plus plus-icon" aria-hidden="true"></i><span class="label-text">{{ "Add" | translatePhrase }}</span></span>
  </div>
  <!--<tooltip-component :show-tooltip="showToolTip" :tooltiptext="key"></tooltip-component>-->
  <div class="window" v-if="active">
    <div class="header">
      <span class="title">
        {{ "Add entity" | translatePhrase }}
      </span>
      <span class="windowControl">
        <i v-on:click="hide" class="fa fa-close"></i>
      </span>
    </div>
    <div class="body">
      <div class="stage-0" v-show="!chooseLocalType">
        <div class="search-header">
          <div class="search">
            {{ "Search" | translatePhrase }}:
            <input v-model="keyword"></input>
            <div class="range-info-container" v-if="getFullRange.length > 0" @mouseleave="rangeInfo = false">
              <i class="fa fa-info-circle" @mouseenter="rangeInfo = true"></i>
              <div class="range-info" v-if="rangeInfo">
                {{ "Allowed types" | translatePhrase }}:
                <br>
                <span v-for="range in getFullRange" class="range">
                  - {{range | labelByLang}}
                </span>
              </div>
            </div>
          </div>
          <div class="local" v-show="allowLocal">
            <button v-on:click="goLocal">{{ "Create local entity" | translatePhrase }}</button>
          </div>
        </div>
        <div v-if="!loading && keyword.length === 0" class="search-status">{{ "Start writing to begin search" | translatePhrase }}...</div>
        <div v-if="loading" class="search-status">{{ "Searching" | translatePhrase }}...<br><i class="fa fa-cog fa-spin"></i></div>
        <div v-if="!loading && searchResult.length === 0 && keyword.length > 0" class="search-status">{{ "No results" | translatePhrase }}...</div>
        <entity-search-list v-if="!loading && keyword.length > 0" :results="searchResult"></entity-search-list>
      </div>
      <div class="stage-1" v-show="chooseLocalType">
        {{ "Choose type" | translatePhrase }}:
        <input list="types" autofocus id="localTypePicker" name="type" v-model="selectedType" @keyup.enter="addType(selectedType)">
        <datalist id="types">
          <option v-for="type in getFullRange" value="{{type | labelByLang}}">
        </datalist>
      </div>
    </div>
  </div>
</div>
</template>

<style lang="less">
@import './_variables.less';

.entity-adder {
  .disabled {
    visibility: hidden;
  }
  > .chip {
    .chip-mixin(transparent, @gray-darker);
    .label-text {
      display: inline-block;
    }
  }
  .add-entity-button {
    opacity: 1;
    transition: opacity 0.5s ease;
    &.fade {
      opacity: 0;
    }
    cursor: pointer;
    text-align: center;
    border: 1px dashed @gray-darker;
    background-color: transparent;
    .chip-label {
      color: @gray-darker;
    }
    &:hover {
      .chip-label {
        color: @gray-darker;
      }
    }
    .chip-action {

    }
  }
  .window {
    .window-mixin();
    .body {
      width: 100%;
      background-color: white;
      border: 1px solid #ccc;
      padding: 0px;
      overflow-y: scroll;
      .stage-1 {
        text-align: center;
        padding: 15px;
      }
      button {
        font-size: 12px;
      }
      .search-result {
        padding-top: 50px;
      }
      .search-header {
        position: absolute;
        width: 100%;
        height: 40px;
        padding: 5px;
        border: solid #ccc;
        border-width: 0px 0px 1px 0px;
        background-color: darken(@neutral-color, 4%);
        .local {
          float: left;
          width: 50%;
          text-align: right;
        }
        .search {
          float: left;
          width: 50%;
          .range-info-container {
            margin-left: 0.5em;
            display: inline-block;
            .range-info {
              position: absolute;
              background-color: #fff;
              border: 1px solid #ccc;
              padding: 5px;
              border-radius: 3px;
              font-size: 1.2rem;
              .range {
                display: block;
                font-size: 1.4rem;
              }
            }
          }
        }
      }
      .search-status {
        padding: 10px;
        padding-top: 50px;
        text-align: center;
        > i {
          font-size: 2rem;
        }
      }
    }
  }

}

</style>
