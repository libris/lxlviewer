<script>
import * as _ from 'lodash';
import * as httpUtil from '../../utils/http';
import * as LayoutUtil from '../../utils/layout';
import * as VocabUtil from '../../utils/vocab';
import * as DisplayUtil from '../../utils/display';
import * as RecordUtil from '../../utils/record';
import * as StringUtil from '../../utils/string';
import * as DataUtil from '../../utils/data';
import Vue from 'vue';
import ProcessedLabel from '../shared/processedlabel';
import ItemEntity from './item-entity';
import DataNode from './datanode';
import CardComponent from '../shared/card-component';
import ToolTipComponent from '../shared/tooltip-component';
import FieldAdder from './fieldadder';
import SearchWindow from './search-window';
import ItemMixin from '../mixins/item-mixin';
import LensMixin from '../mixins/lens-mixin';
import {mixin as clickaway} from 'vue-clickaway';
import { changeNotification, changeStatus } from '../../vuex/actions';
import { getUser, getSettings, getContext, getVocabulary, getVocabularyClasses, getVocabularyProperties, getDisplayDefinitions, getEditorData, getStatus } from '../../vuex/getters';

export default {
  name: 'item-local',
  mixins: [ItemMixin, LensMixin, clickaway],
  props: {
    item: {},
    key: '',
    entityType: '',
    index: Number,
    isLocked: false,
    showActionButtons: false,
    parentPath: '',
    inArray: false,
  },
  vuex: {
    getters: {
      context: getContext,
      vocab: getVocabulary,
      vocabClasses: getVocabularyClasses,
      vocabProperties: getVocabularyProperties,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
      status: getStatus,
      user: getUser,
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
      extractDialogActive: false,
      extracting: false,
      expanded: false,
      removeHover: false,
      showLinkAction: false,
      copyTitle: false,
    };
  },
  computed: {
    canCopyTitle() {
      if (this.isExtractable && !this.item.hasOwnProperty('hasTitle') && this.key === 'instanceOf') {
        return true;
      }
      return false;
    },
    extractedItem() {
      const newRecord = {};
      newRecord.descriptionCreator = { '@id': `https://libris.kb.se/library/${this.user.settings.activeSigel}` };
      const objAsRecord = RecordUtil.getObjectAsRecord(this.extractedMainEntity, newRecord);
      return objAsRecord;
    },
    extractedMainEntity() {
      const cleanObj = DataUtil.removeNullValues(this.item);

      if (this.copyTitle) {
        cleanObj['hasTitle'] = this.editorData.mainEntity.hasTitle;
      }
      return cleanObj;
    },
    isExtractable() {
      const classId = `${this.settings.vocabPfx}${this.item['@type']}`;
      if (!VocabUtil.isEmbedded(classId, this.vocab, this.settings, this.context)) {
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
      delete fItem['_uid'];
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
        [StringUtil.convertToVocabKey(StringUtil.convertToBaseUri(formObj['@type'], this.context), this.context)],
        this.vocabClasses,
        this.settings.vocabPfx,
        this.vocabProperties,
        this.context
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
      if (this.status.inEdit) {
        this.changeStatus('keybindState', 'extraction-dialog');
        LayoutUtil.scrollLock(true);
        this.extractDialogActive = true;
      }
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
      requestMethod({ url, token: self.access_token, activeSigel: this.user.settings.activeSigel }, obj).then((result) => {
        if (result.status === 201) {
          const postUrl = `${result.getResponseHeader('Location')}`;
          httpUtil.get({ url: `${postUrl}/data.jsonld`, accept: 'application/ld+json' }).then((getResult) => {
            const recievedObj = {
              '@graph': getResult['@graph'],
            }
            const mainEntity = RecordUtil.splitJson(recievedObj).mainEntity;
            this.$dispatch('add-item', mainEntity, this.index);
            this.changeNotification('color', 'green');
            this.changeNotification('message', `${StringUtil.getUiPhraseByLang('Linking was successful', this.settings.language)}`);
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
          }, 3000);
        });
      }
    },
    'set-copy-title'(bool) {
      this.copyTitle = bool;
    },
    'expand-item'() {
      this.expand();
      return true;
    },
    'collapse-item'() {
      this.collapse();
      return true;
    },
    'extract-item'() {
      this.extracting = true;
      this.doExtract();
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
    'search-window': SearchWindow,
  },
};
</script>

<template>
  <div class="item-local-container" v-bind:class="{'highlight': isNewlyAdded, 'expanded': expanded}">
    <div class="link-indicator" :class="{'active': showLinkAction && status.inEdit}" v-if="isExtractable" @click="openExtractDialog" @mouseover="showLinkAction = true" @mouseout="showLinkAction = false">
      <i v-show="showLinkAction && status.inEdit" class="fa fa-link"><tooltip-component :show-tooltip="showLinkAction" tooltip-text="Link entity" translation="translatePhrase"></tooltip-component></i>
      <i v-show="!showLinkAction || !status.inEdit" class="fa fa-unlink"></i>
    </div>
    <div v-if="!isExpandedType" class="item-local" :class="{'expanded': expanded, 'distinguish-removal': removeHover}">
      <div class="topbar">
        <i class="fa fa-chevron-right" :class="{'down': expanded}" @click="toggleExpanded()"></i>
        <span class="type" @click="toggleExpanded()" :title="item['@type']">{{ item['@type'] | labelByLang | capitalize }}</span>
        <span class="collapsed-label" @click="toggleExpanded()"><span v-show="!expanded || isEmpty">{{getItemLabel}}</span><span class="placeholder">.</span></span>
        <span class="actions">
          <i v-if="!isLocked" class="fa fa-trash-o chip-action" :class="{'show-icon': showActionButtons}" v-on:click="removeThis(true)" @mouseover="removeHover = true" @mouseout="removeHover = false">
            <tooltip-component :show-tooltip="removeHover" tooltip-text="Remove" translation="translatePhrase"></tooltip-component>
          </i>
          <field-adder v-if="!isLocked" :entity-type="item['@type']" :allowed="allowedProperties" :inner="true" :path="getPath"></field-adder>
        </span>
      </div>
      <field-adder v-if="!isLocked && isEmpty" :entity-type="item['@type']" :allowed="allowedProperties" :inner="true" :path="getPath"></field-adder>
      <data-node v-show="expanded && k !== '_uid'" v-for="(k,v) in filteredItem" :parent-path="getPath" :entity-type="item['@type']" :is-inner="true" :is-locked="isLocked" :is-removable="false" :embedded="true" :parent-key="key" :parent-index="index" :key="k" :value="v" :focus="focus" :show-action-buttons="showActionButtons"></data-node>
    </div>
    <card-component v-if="isExpandedType" :title="getItemLabel" :focus-data="item" :uri="item['@id']" :is-local="true" :is-extractable="isExtractable" :is-locked="isLocked"></card-component>
    <search-window :active="extractDialogActive" :can-copy-title="canCopyTitle" :copy-title="copyTitle" :entity-type="entityType" :key="key" :extracting="extracting" :item-info="extractedMainEntity" :index="index"></search-window>
  </div>
</template>

<style lang="less">

.item-local-container {
  padding: 2px 0px;
  margin: 0px 0px 0px 0px;
  box-shadow: 0px 0px 1em 0px transparent;
  outline: 2px solid transparent;
  transition: 0.5s ease margin, 3s ease-in box-shadow, 3s ease-in outline;
  display: flex;

  .link-indicator {
    padding: 0em 0.6em;
    background: green;
    display: flex;
    align-items: center;
    background: @gray-darker;
    color: @white;
    &.active {
      background: lighten(@gray-darker, 15%);
      cursor: pointer;
    }
  }
  &.highlight {
    transition: 0s ease;
    transition-property: outline, box-shadow;
    outline: 2px solid @highlight-color;
    box-shadow: 0px 0px 1em 0px @highlight-color;
  }
  &.expanded {
    margin: 0 0 2em 0;
  }
  .item-local {
    width: 100%;
    background-color: @color-local;
    box-shadow: @shadow-chip;
    border: 1px solid rgba(0, 0, 0, 0.15);
    line-height: 1.6;
    max-height: 40px;
    overflow: hidden;
    transition: 0.5s ease max-height, 1.0s ease box-shadow;
    &.distinguish-removal {
      > .topbar {
        background-color: rgba(255,0,0,.1);
      }
    }
    &.expanded {
      max-height: 400vh;
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
      border: 1px solid transparent;
    }
    > .topbar {
      display: flex;
      align-items: center;
      padding: 5px 0;
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
}

</style>
