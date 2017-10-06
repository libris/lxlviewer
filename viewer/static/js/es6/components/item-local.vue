<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as LayoutUtil from '../utils/layout';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as RecordUtil from '../utils/record';
import * as StringUtil from '../utils/string';
import Vue from 'vue';
import ProcessedLabel from './processedlabel';
import ItemEntity from './item-entity';
import DataNode from './datanode';
import CardComponent from './card-component';
import ToolTipComponent from './tooltip-component';
import FieldAdder from './fieldadder';
import ItemMixin from './mixins/item-mixin';
import LensMixin from './mixins/lens-mixin';
import {mixin as clickaway} from 'vue-clickaway';
import { changeNotification, changeStatus } from '../vuex/actions';
import { getSettings, getVocabulary, getVocabularyClasses, getVocabularyProperties, getDisplayDefinitions, getEditorData, getStatus } from '../vuex/getters';

export default {
  name: 'item-local',
  mixins: [ItemMixin, LensMixin, clickaway],
  props: {
    item: {},
    key: '',
    index: Number,
    isLocked: false,
    showActionButtons: false,
    isExpandedType: false,
    parentPath: '',
    inArray: false,
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      vocabClasses: getVocabularyClasses,
      vocabProperties: getVocabularyProperties,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
      status: getStatus,
    },
    actions: {
      changeStatus,
      changeNotification,
    },
  },
  data() {
    return {
      inEdit: false,
      showCardInfo: false,
      isNewlyAdded: false,
      searchResult: {},
      searchDelay: 2,
      extractDialogActive: false,
      extracting: false,
      expanded: this.status.isNew,
      removeHover: false,
      showToolTip: false,
    };
  },
  computed: {
    extractedItem() {
      return RecordUtil.getObjectAsRecord(this.focusData);
    },
    isExtractable() {
      const classId = `${this.settings.vocabPfx}${this.item['@type']}`;
      if (
        this.settings.nonExtractableClasses.indexOf(this.item['@type']) === -1 &&
        !VocabUtil.isEmbedded(classId, this.vocab, this.settings)
      ) {
        return true;
      }
      return false;
    },
    getPath() {
      if (this.inArray) {
        return `${this.parentPath}[${this.index}]`;
      }
      return this.parentPath;
    },
    filteredItem() {
      const fItem = Object.assign({}, this.item);
      delete fItem['@type'];
      return fItem;
    },
    formObj() {
      return this.getForm(this.item);
    },
    isEmpty() {
      let bEmpty = true;
      // Check if item has any keys besides @type and _uid. If not, we'll consider it empty.
      _.each(this.item, (value, key) => {
        if (key !== '@type' && key !== '_uid') {
          if (typeof value !== 'undefined') {
            bEmpty = false;
          }
        }
      });
      return bEmpty;
    },
    allowedProperties() {
      const settings = this.settings;
      const formObj = this.item;
      const allowed = VocabUtil.getPropertiesFromArray(
        formObj['@type'],
        this.vocab,
        this.settings.vocabPfx,
        this.vocabProperties
      );
      // Add the "added" property
      for (const element of allowed) {
        const oId = element.item['@id'].replace(settings.vocabPfx, '');
        element.added = (formObj.hasOwnProperty(oId) && formObj[oId] !== null);
      }

      const extendedAllowed = allowed.map(property => {
        const labelByLang = property.item.labelByLang;
        if (typeof labelByLang !== 'undefined') {
          // Try to get the label in the preferred language
          let label = ((typeof labelByLang[this.settings.language] !== 'undefined') ? labelByLang[this.settings.language] : labelByLang.en);
          // If several labels are present, use the first one
          if (_.isArray(label)) {
            label = label[0];
          }
          return {
            added: property.added,
            item: property.item,
            label: label
          };
        } else {
          // If no label, use @id as label
          return {
            added: property.added,
            item: property.item,
            label: property.item['@id']
          };
        }
      });
      sortedAllowed = _.sortBy(extendedAllowed, (prop) => {
        return prop.label.toLowerCase();
      });
      return sortedAllowed;
    },
  },
  created() {
    this.$options.components['data-node'] = Vue.extend(DataNode);
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
    openExtractDialog() {
      this.changeStatus('keybindState', 'extraction-dialog');
      LayoutUtil.scrollLock(true);
      this.extractDialogActive = true;
    },
    closeExtractDialog() {
      this.changeStatus('keybindState', 'overview');
      LayoutUtil.scrollLock(false);
      this.extractDialogActive = false;
      this.extracting = false;
    },
    doExtract() {
      this.extracting = true;

      // TODO: Remove this when Summary isn't broken
      const hackedObject = this.extractedItem;
      delete hackedObject['@graph'][1].summary;
      this.doCreateRequest(httpUtil.post, hackedObject, '/');

      // this.doCreateRequest(httpUtil.post, this.extracted, '/');
    },
    doCreateRequest(requestMethod, obj, url) {
      requestMethod({ url, token: self.access_token }, obj).then((result) => {
        if (result.status === 201) {
          const postUrl = `${result.getResponseHeader('Location')}/data.jsonld`;
          httpUtil.get({ url: postUrl }).then((getResult) => {
            const recievedObj = {
              '@graph': getResult['@graph'],
            }
            const mainEntity = RecordUtil.splitJson(recievedObj).mainEntity;
            this.$dispatch('add-item', mainEntity, this.index);
            this.changeNotification('color', 'green');
            this.changeNotification('message', `${StringUtil.getUiPhraseByLang('Extraction was successful', this.settings.language)}`);
            this.closeExtractDialog();
          }, (error) => {
            this.changeNotification('color', 'red');
            this.changeNotification('message', `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${StringUtil.getUiPhraseByLang(error, this.settings.language)}`);
            this.closeExtractDialog();
          });
        } else {
          this.changeNotification('color', 'red');
          this.changeNotification('message', `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${StringUtil.getUiPhraseByLang(error, this.settings.language)}`);
          this.closeExtractDialog();
        }
      }, (error) => {
        this.changeNotification('color', 'red');
        this.changeNotification('message', `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${StringUtil.getUiPhraseByLang(error, this.settings.language)}`);
        this.closeExtractDialog();
      });
    },
    getForm(item) {
      const formObj = {};
      if (!item['@type']) {
        return formObj;
      }
      let inputKeys = DisplayUtil.getProperties(
        item['@type'],
        'cards',
        this.display,
        this.settings
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
            this.display,
            this.settings
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
          formObj[key] = [];
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
    addFocus() {
      this.focused = true;
    },
    removeFocus() {
      this.focused = false;
    },
  },
  events: {
    'focus-new-item'(index) {
      if (this.index === index) {
        this.expand();
        this.isNewlyAdded = true;

        // Scroll to item
        const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
        const scrollPos = this.$el.offsetTop - (windowHeight * 0.2);
        LayoutUtil.scrollTo(scrollPos, 1000, 'easeInOutQuad', () => {
          setTimeout(() => {
            this.isNewlyAdded = false;
          }, 1500);
        });
      }
    },
    'expand-item'() {
      this.expand();
    },
    'collapse-item'() {
      this.collapse();
    },
    'extract-item'() {
      this.openExtractDialog();
    },
    'close-modals'() {
      this.closeExtractDialog();
      return true;
    },
  },
  ready() {
    this.$nextTick(() => {
    });
  },
  components: {
    'processed-label': ProcessedLabel,
    'item-entity': ItemEntity,
    'card-component': CardComponent,
    'field-adder': FieldAdder,
    'tooltip-component': ToolTipComponent,
  },
};
</script>

<template>
  <div class="item-local-container" v-bind:class="{'highlight': isNewlyAdded}">
    <div v-if="!isExpandedType" class="item-local" :class="{'expanded': expanded, 'distinguish-removal': removeHover}">
      <div class="topbar">
        <i class="fa fa-chevron-right" :class="{'down': expanded}" @click="toggleExpanded()"></i>
        <span class="type" @click="toggleExpanded()" title="{{ item['@type'] }}">{{ item['@type'] | labelByLang | capitalize }}</span>
        <span class="collapsed-label" @click="toggleExpanded()"><span v-show="!expanded || isEmpty">{{getItemLabel}}</span><span class="placeholder">.</span></span>
        <span class="actions">
          <i v-if="!isLocked" class="fa fa-trash-o chip-action" :class="{'show-icon': showActionButtons}" v-on:click="removeThis(true)" @mouseover="removeHover = true" @mouseout="removeHover = false"></i>
          <field-adder v-if="!isLocked && expanded" :allowed="allowedProperties" :inner="true" :path="getPath"></field-adder>
          <i v-if="isExtractable && !isLocked" class="chip-action fa fa-share-square-o" v-on:click="openExtractDialog" v-if="!isLocked" @mouseover="showToolTip = true" @mouseout="showToolTip = false">
            <tooltip-component :show-tooltip="showToolTip" tooltip-text="Extract entity" translation="translatePhrase"></tooltip-component>
          </i>
        </span>
      </div>
      <field-adder v-if="!isLocked && isEmpty" :allowed="allowedProperties" :inner="true" :path="getPath"></field-adder>
      <data-node v-show="expanded && k !== '_uid'" v-for="(k,v) in filteredItem" :parent-path="getPath" :entity-type="item['@type']" :is-inner="true" :is-locked="isLocked" :allow-local="true" :is-removable="false" :embedded="true" :parent-key="key" :parent-index="index" :key="k" :value="v" :focus="focus" :show-action-buttons="showActionButtons"></data-node>
    </div>
    <card-component v-if="isExpandedType" :title="getItemLabel" :focus-data="item" :uri="item['@id']" :is-local="true" :is-extractable="isExtractable" :is-locked="isLocked"></card-component>
    <div class="window" v-if="extractDialogActive">
      <div class="header">
        <span class="title">
          {{ "Bryt ut entitet" | translatePhrase }}
        </span>
        <span class="windowControl">
          <i v-on:click="closeExtractDialog" class="fa fa-close"></i>
        </span>
      </div>
      <div class="body">
        <p class="extractLeadingText">
          Utbrytning av:<br><strong>"{{getItemLabel}}"</strong>
        </p>
        <p>
          Den här operationen kommer att skapa en egen post utav den lokala entiteten. Detta gör att entiteten går att länka till från denna och andra poster (och på det sättet kunna återanvändas).
        </p>
        <p>
          När den nya posten är skapad kommer den att ersätta den lokala versionen i den post du nu står i.
        </p>
        <hr>
        <div class="button-container">
          <p>
            Vill du bryta ut entiteten till en egen post?
          </p>
          <button class="acceptExtractButton" v-on:click="doExtract" v-show="!extracting">{{ "Ja, bryt ut" | translatePhrase }}</button>
          <button class="declineExtractButton" v-on:click="closeExtractDialog" v-show="!extracting">{{ "Nej, avbryt" | translatePhrase }}</button>
          <div v-show="extracting"><i class="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i> {{ "Extracting" | translatePhrase }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';
.item-local-container {
  padding: 2px 0px;
  margin: 0px 0px 0px 0px;
  box-shadow: 0px 0px 1em 0px transparent;
  outline: 2px solid transparent;
  // transition: 3s ease;
  // transition-property: outline, box-shadow;
  &.highlight {
    outline: 2px solid @highlight-color;
    box-shadow: 0px 0px 1em 0px @highlight-color;
  }
  .item-local {
    width: 100%;
    background-color: @color-local;
    box-shadow: @shadow-chip;
    border: 1px solid rgba(0, 0, 0, 0.15);
    line-height: 1.6;
    max-height: 40px;
    overflow: hidden;
    transition: 0.5s ease margin, 0.5s ease max-height, 1.0s ease box-shadow;
    &.distinguish-removal {
      padding-bottom: 2px;
      > .topbar {
        background-color: rgba(255,0,0,.1);
      }
    }
    &.expanded {
      margin: 0 0 2em 0;
      max-height: 200vh;
      box-shadow: @shadow-chip-elevated;
    }
    &.removed {
      transition: all 0.5s ease;
      max-height: 0px;
      margin: 0px;
      border: none;
    }
    > div {
      padding: 5px;
    }
    > .topbar {
      display: flex;
      align-items: center;
      padding: 5px;
      background: @topbar-color;
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

    .item-label {
      display: block;
    }
  }
  .window {
    .window-mixin();
    .body {
      padding: 2em;
      .extractLeadingText {
        text-align: center;
      }
      .button-container {
        text-align: center;
        button {
          padding: 0px 1em;
        }
        .acceptExtractButton {
          margin-right: 2em;
        }
        .declineExtractButton {

        }
      }
    }
  }
}

</style>
