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
import CardComponent from '../shared/card-component';
import ToolTipComponent from '../shared/tooltip-component';
import FieldAdder from '@/components/inspector/field-adder';
import SearchWindow from './search-window';
import ItemMixin from '../mixins/item-mixin';
import LensMixin from '../mixins/lens-mixin';
import {mixin as clickaway} from 'vue-clickaway';
import { mapGetters } from 'vuex';

export default {
  name: 'item-local',
  mixins: [ItemMixin, LensMixin, clickaway],
  props: {
    item: {},
    fieldKey: '',
    entityType: '',
    index: Number,
    isLocked: false,
    showActionButtons: false,
    parentPath: '',
    inArray: false,
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
    ...mapGetters([
      'inspector',
      'resources',
      'settings',
      'user',
      'status',
    ]),
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
      if (!VocabUtil.isEmbedded(classId, this.resources.vocab, this.settings, this.resources.context)) {
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
      delete fItem['@id'];
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
        [StringUtil.convertToVocabKey(StringUtil.convertToBaseUri(formObj['@type'], this.resources.context), this.resources.context)],
        this.resources.vocabClasses,
        this.settings.vocabPfx,
        this.resources.vocabProperties,
        this.resources.context
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
      const sortedAllowed = _.sortBy(extendedAllowed, (prop) => {
        return prop.label.toLowerCase();
      });
      return sortedAllowed;
    },
  },
  methods: {
    highlightItem(event) {
      let item = event.target;
      while ((item = item.parentElement) && !item.classList.contains('js-itemLocal'));
      item.classList.add('is-affected');
    },
    unHighlightItem(event) {
      let item = event.target;
      while ((item = item.parentElement) && !item.classList.contains('js-itemLocal'));
      item.classList.remove('is-affected');
    },
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
      if (this.inspector.status.editing) {
        this.$store.dispatch('setStatusValue', { 
          property: 'keybindState', 
          value: 'extraction-dialog' 
        });
        LayoutUtil.scrollLock(true);
        this.extractDialogActive = true;
      }
    },
    closeExtractDialog() {
      this.$store.dispatch('setStatusValue', { 
        property: 'keybindState', 
        value: 'overview' 
      });
      LayoutUtil.scrollLock(false);
      this.extractDialogActive = false;
      this.extracting = false;
    },
    doExtract() {
      this.extracting = true;

      // TODO: Remove this when Summary isn't broken
      const hackedObject = this.extractedItem;
      delete hackedObject['@graph'][1].summary;
      this.doCreateRequest(httpUtil.post, hackedObject, this.settings.apiPath);
    },
    doCreateRequest(requestMethod, obj, url) {
      requestMethod({ url, token: this.user.token, activeSigel: this.user.settings.activeSigel }, obj).then((result) => {
        if (result.status === 201) {
          const postUrl = `${result.getResponseHeader('Location')}`;
          httpUtil.get({ url: `${postUrl}/data.jsonld`, contentType: 'text/plain' }).then((getResult) => {
            const recievedObj = {
              '@graph': getResult['@graph'],
            }
            const mainEntity = RecordUtil.splitJson(recievedObj).mainEntity;
            const newValue = { '@id': mainEntity['@id'] };

            this.$store.dispatch('addToQuoted', mainEntity);
            this.$store.dispatch('updateInspectorData', {
              path: `${this.path}`,
              value: newValue,
              addToHistory: true,
            });
            this.$store.dispatch('pushNotification', { color: 'green', message: `${StringUtil.getUiPhraseByLang('Linking was successful', this.settings.language)}` });
            this.closeExtractDialog();
          }, (error) => {
            this.$store.dispatch('pushNotification', { color: 'red', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error}` });
            this.closeExtractDialog();
          });
        } else {
          this.$store.dispatch('pushNotification', { color: 'red', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error}` });
          this.closeExtractDialog();
        }
      }, (error) => {
        this.$store.dispatch('pushNotification', { color: 'red', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error}` });
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
        this.resources.display,
        this.settings
      );
      if (inputKeys.length === 0) {
        const baseClasses = VocabUtil.getBaseClassesFromArray(
          item['@type'],
          this.resources.vocab,
          this.settings.vocabPfx
        );
        for (const className of baseClasses) {
          inputKeys = DisplayUtil.getProperties(
            className.replace(this.settings.vocabPfx, ''),
            'cards',
            this.resources.display,
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
    extract() {
      this.extracting = true;
      this.doExtract();
    },
    replaceWith(value) {
      const newValue = { '@id': value['@id'] };
      this.$store.dispatch('addToQuoted', value);
      this.$store.dispatch('updateInspectorData', {
        path: `${this.path}`,
        value: newValue,
        addToHistory: true,
      });
      this.$store.dispatch('pushNotification', { color: 'green', message: `${StringUtil.getUiPhraseByLang('Linking was successful', this.settings.language)}` });
      this.closeExtractDialog();
    },
  },
  watch: {
    'inspector.event'(val, oldVal) {
      this.$emit(`${val.value}`);
    }
  },
  created: function () {
    this.$on('collapse-item', this.collapse);
    this.$on('expand-item', this.expand);
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
  },
  mounted() {
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
  <div class="ItemLocal js-itemLocal"
    tabindex="0"
    @keyup.enter="toggleExpanded()"
    :class="{'highlight': isNewlyAdded, 'is-expanded': expanded}">
   
   <strong class="ItemLocal-heading">
      <i class="ItemLocal-arrow fa fa-chevron-right " 
        :class="{'down': expanded}" @click="toggleExpanded()"></i>
      <span class="type" 
        @click="toggleExpanded($event)" 
        :title="item['@type']">{{ item['@type'] | labelByLang | capitalize }}:</span>
      <span class="collapsed-label" @click="toggleExpanded()">
        <span v-show="!expanded || isEmpty">{{getItemLabel}}</span>
        <span class="placeholder"> </span>
      </span>
      
      <div class="ItemLocal-actions"
        @mouseover="highlightItem($event)"
        @mouseout="unHighlightItem($event)">

        <field-adder class="ItemLocal-action"
          v-if="!isLocked" 
          :entity-type="item['@type']" 
          :allowed="allowedProperties" 
          :inner="true" 
          :path="getPath"></field-adder>
         
        <i class="ItemLocal-action fa fa-link"
          v-if="inspector.status.editing && isExtractable"
          @click="openExtractDialog()" 
          @mouseover="showLinkAction = true" 
          @mouseout="showLinkAction = false">
          <tooltip-component 
            :show-tooltip="showLinkAction" 
            tooltip-text="Link entity" 
            translation="translatePhrase"></tooltip-component>
        </i>
        <i class="ItemLocal-action fa fa-trash-o chip-action" 
          v-if="!isLocked" 
          :class="{'show-icon': showActionButtons}" 
          v-on:click="removeThis(true)" 
          @mouseover="removeHover = true" 
          @mouseout="removeHover = false">
          <tooltip-component 
            :show-tooltip="removeHover" 
            tooltip-text="Remove" 
            translation="translatePhrase"></tooltip-component>
        </i>
      </div>
    </strong>
  
    <ul class="ItemLocal-list js-itemLocalFields">      
      <field-adder 
        v-if="!isLocked && isEmpty" 
        :entity-type="item['@type']" 
        :allowed="allowedProperties" 
        :inner="true" 
        :path="getPath"></field-adder>
      <field
        v-show="expanded && k !== '_uid'" 
        v-for="(v, k) in filteredItem" 
        :parent-path="getPath" 
        :entity-type="item['@type']" 
        :is-inner="true" 
        :is-locked="isLocked" 
        :is-removable="false" 
        :as-columns="false" 
        :parent-key="fieldKey" 
        :parent-index="index" 
        :field-key="k" 
        :field-value="v" 
        :key="k" 
        :show-action-buttons="showActionButtons"></field>
    </ul>
       
    <search-window 
      :active="extractDialogActive" 
      :can-copy-title="canCopyTitle" 
      :copy-title="copyTitle" 
      :entity-type="entityType" 
      :field-key="fieldKey" 
      :extracting="extracting" 
      :item-info="extractedMainEntity"
      :index="index"
      @extract="extract"
      @replace-with="replaceWith"
      ></search-window>
    </div>


</template>

<style lang="less">

.ItemLocal {
  padding: 10px 5px;
  margin: -5px;
  position: relative;
  flex: 1 100%;

  &-heading {
    display: block;
    flex: 1 100%;
    font-weight: normal;
    margin: 0 0 5px;
    position: relative;
  }

  &-arrow {
    transition: all 0.2s ease;
    padding: 0 2px;
    margin: 0 0 0 1px;
    cursor: pointer;
  }

  &-list {
    flex: 1 100%;
    position: relative;
    padding: 0 0 0 20px;

    > .is-expanded & {
      margin: 10px 0 0;
    }
  }

  &-actions {
    float: right;
    position: relative;
  }

  &-action {
    display: inline-block;
    color: @gray-dark;
    cursor: pointer;
    display: inline-block;
    margin: 0 5px 0 0;
    opacity: 1;
    transition: opacity 0.5s ease;

    &:hover {
      color: @black;
    }
  }

  &.is-affected {
    outline: 2px solid @brand-primary;
  }

}

.is-expanded > .ItemLocal-heading > .ItemLocal-arrow {
  transform:rotate(90deg);

  &::before {
    vertical-align: sub;
  }
}

.item-local-container {

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
  &.is-expanded {
    margin: 0 0 2em 0;
  }
  .item-local {

    &.is-expanded {
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
