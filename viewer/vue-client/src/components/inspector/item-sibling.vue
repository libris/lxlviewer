<script>
/*
  This component is used for the special case for when we want to show a sibling (ie a work in an instance)
  as an item-local in mainEntity. Most of the functionality is similar to those in item-local, but with some
  important differences. Examples of this is the path-variables as they are pointing to one place for what data to show,
  and to another for what data to edit.
*/

import { cloneDeep, each } from 'lodash-es';
import { mixin as clickaway } from 'vue-clickaway';
import { mapGetters } from 'vuex';
import * as httpUtil from '@/utils/http';
import * as LayoutUtil from '@/utils/layout';
import * as RecordUtil from '@/utils/record';
import * as StringUtil from '@/utils/string';
import ItemMixin from '@/components/mixins/item-mixin';
import LensMixin from '@/components/mixins/lens-mixin';
import FormMixin from '@/components/mixins/form-mixin';
import FieldAdder from '@/components/inspector/field-adder';
import SearchWindow from '@/components/inspector/search-window';

export default {
  name: 'item-sibling',
  mixins: [FormMixin, ItemMixin, LensMixin, clickaway],
  props: {
    id: {
      type: String,
      default: '',
    },
    entityType: {
      type: String,
      default: '',
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    showActionButtons: {
      type: Boolean,
      default: false,
    },
    allSearchTypes: {
      type: Array,
      default: () => [],
    },
    allValuesFrom: {
      type: Array,
      default: () => [],
    },
    someValuesFrom: {
      type: Array,
      default: () => [],
    },
    range: {
      type: Array,
      default: () => [],
    },
    rangeFull: {
      type: Array,
      default: () => [],
    },
    inArray: {
      type: Boolean,
      default: false,
    },
    shouldExpand: {
      type: Boolean,
      default: false,
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
      expandChildren: false,
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
    item() {
      const item = cloneDeep(this.inspector.data[this.fragmentId]);
      if (typeof item === 'undefined' || item === null) {
        this.$store.dispatch('pushNotification', {
          type: 'danger',
          message: `${StringUtil.getUiPhraseByLang('Data is missing a reference, please verify file', this.user.settings.language)}`,
        });
        throw new Error('A sibling-item was undefined. This is probably a reference error in the data.');
      }
      return item;
    },
    fragmentId() {
      const s = this.id.split('#')[1];
      if (s === 'it') {
        return 'mainEntity';
      }
      return s;
    },
    canCopyTitle() {
      if (this.isExtractable && !this.item.hasOwnProperty('hasTitle') && this.key === 'instanceOf') {
        return true;
      }
      return false;
    },
    isLastAdded() {
      if (this.inspector.status.lastAdded === this.getPath) {
        return true;
      }
      return false;
    },
    getPath() {
      return this.fragmentId;
    },
    isEmpty() {
      let bEmpty = true;
      // Check if item has any keys besides @type and _uid. If not, we'll consider it empty.
      each(this.item, (value, key) => {
        if (key !== '_uid') {
          if (key !== '@id') {
            if (typeof value !== 'undefined') {
              bEmpty = false;
            }
          }
        }
      });
      return bEmpty;
    },
    formObj() {
      return this.item;
    },
  },
  methods: {
    highLightLastAdded() {
      const element = this.$el;
      LayoutUtil.ensureInViewport(element);
    },
    removeThis() {
      const changeList = [
        {
          path: `${this.parentPath}`,
          value: null,
        },
      ];
      if (this.fieldKey === 'instanceOf') {
        changeList.push({
          path: 'work',
          value: null,
        });
      }
      this.$store.dispatch('updateInspectorData', {
        addToHistory: true,
        changeList: changeList,
      });
    },
    actionHighlight(event, active) {
      if (active) {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-itemLocal'));
        item.classList.add('is-marked');
      } else {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-itemLocal'));
        item.classList.remove('is-marked');
      }
    },
    removeHighlight(event, active) {
      if (active) {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-itemLocal'));
        item.classList.add('is-removeable');
      } else {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-itemLocal'));
        item.classList.remove('is-removeable');
      }
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
        this.extractDialogActive = true;
      }
    },
    closeExtractDialog() {
      this.extractDialogActive = false;
      this.extracting = false;
    },
    doExtract() {
      this.extracting = true;

      // TODO: Remove this when Summary isn't broken
      const hackedObject = this.extractedItem;
      delete hackedObject['@graph'][1].summary;
      this.doCreateRequest(httpUtil.post, hackedObject, `${this.settings.apiPath}/data`);
    },
    doCreateRequest(requestMethod, obj, url) {
      requestMethod({ url, token: this.user.token, activeSigel: this.user.settings.activeSigel }, obj).then((result) => {
        if (result.status === 201) {
          const postUrl = `${result.getResponseHeader('Location')}`;
          httpUtil.get({ url: `${postUrl}/data.jsonld`, contentType: 'text/plain' }).then((getResult) => {
            const recievedObj = {
              '@graph': getResult['@graph'],
            };
            const mainEntity = RecordUtil.splitJson(recievedObj).mainEntity;
            this.replaceWith(mainEntity);
            this.closeExtractDialog();
          }, (error) => {
            this.$store.dispatch('pushNotification', { type: 'danger', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)} - ${error}` });
            this.closeExtractDialog();
          });
        } else {
          this.$store.dispatch('pushNotification', { type: 'danger', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)}` });
          this.closeExtractDialog();
        }
      }, (error) => {
        this.$store.dispatch('pushNotification', { type: 'danger', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)} - ${error}` });
        this.closeExtractDialog();
      });
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
    checkFocus() {
      if (this.focused) {
        this.toggleExpanded();
      }
    },
    replaceWith(value) {
      const newValue = { '@id': value['@id'] };
      this.$store.dispatch('addToQuoted', value);
      const changeList = [
        {
          // Remove the link
          path: `${this.parentPath}`,
          value: newValue,
        },
        {
          // Remove the #work
          path: `${this.getPath}`,
          value: null,
        },
      ];
      this.$store.dispatch('updateInspectorData', {
        addToHistory: true,
        changeList: changeList,
      });
      this.$store.dispatch('pushNotification', { type: 'success', message: `${StringUtil.getUiPhraseByLang('Linking was successful', this.user.settings.language)}` });
      this.$store.dispatch('setInspectorStatusValue', { 
        property: 'lastAdded', 
        value: `${this.parentPath}.{"@id":"${newValue['@id']}"}`,
      });
      this.closeExtractDialog();
    },
    expandAllChildren() {
      this.expandChildren = true;
      this.$nextTick(this.focusFirstInput);
    },
    focusFirstInput() {
      const firstInput = this.$el.querySelector('.js-itemValueInput');
      if (firstInput) {
        firstInput.focus();
      }
    },
  },
  watch: {
    'inspector.event'(val) {
      this.$emit(`${val.value}`);
    },
    shouldExpand(val) {
      if (val) {
        this.expand();
        this.expandChildren = true;
      }
    },
  },
  created() {
    this.$on('collapse-item', () => {
      if (this.getPath.startsWith(this.inspector.status.focus) // Only expand part of form that has focus
          || (this.getPath.startsWith('work') && this.inspector.status.focus === 'mainEntity')) {
        this.collapse();
      }
    });
    this.$on('expand-item', () => {
      if (this.getPath.startsWith(this.inspector.status.focus)
          || (this.getPath.startsWith('work') && this.inspector.status.focus === 'mainEntity')) {
        this.expand();
      }
    });
  },
  mounted() {
    if (this.isLastAdded) {
      this.highLightLastAdded();
      const fieldAdder = this.$refs.fieldAdder;
      if (this.isEmpty) {
        LayoutUtil.enableTabbing();
        fieldAdder.$refs.adderButton.focus();
      } else {
        this.expand();
        this.expandAllChildren();
      }
      setTimeout(() => {
        if (this.isLastAdded) {
          this.$store.dispatch('setInspectorStatusValue', { property: 'lastAdded', value: '' });
        }
      }, 1000);
    }
    if (this.shouldExpand) {
      this.expand();
      this.expandChildren = true;
    }
    if (this.inspector.status.isNew) {
      this.expand();
    }
  },

  components: {
    'field-adder': FieldAdder,
    'search-window': SearchWindow,
  },
};
</script>

<template>
  <div class="ItemSibling js-itemLocal"
    :id="`formPath-${path}`"
    :class="{'is-highlighted': isNewlyAdded, 'is-expanded': expanded && !isEmpty, 'is-extractable': isExtractable}"
    :tabindex="isEmpty ? -1 : 0"
    @keyup.enter="checkFocus()" 
    @focus="addFocus()"
    @blur="removeFocus()">

    <strong class="ItemSibling-heading">
      <div class="ItemSibling-label"
        :class="{'is-inactive': isEmpty, 'is-locked': isLocked }"
        @click="toggleExpanded()">
        <i class="ItemSibling-arrow fa fa-chevron-right" 
          :class="{'icon is-disabled' : isEmpty}"></i>
        <span class="ItemSibling-type"
          :title="item['@type']">{{ item['@type'] | labelByLang | capitalize }}:</span>
        <span class="ItemSibling-collapsedLabel">
          <span class="ItemSibling-collapsedText" v-show="!expanded || isEmpty">{{getItemLabel}}</span>
          <span class="placeholder"> </span>
        </span>
      </div>
      
      <div class="ItemSibling-actions">
        <div class="ItemSibling-action LinkAction">
          <i class="fa fa-link fa-fw icon icon--sm"
            role="button"
            :aria-label="'Link entity' | translatePhrase"
            tabindex="0"
            v-if="inspector.status.editing && !isEmbedded && !isLocked"
            v-tooltip.top="translate('Link entity')"
            @click="openExtractDialog(), expand()"
            @keyup.enter="openExtractDialog(), expand()"
            @focus="showLinkAction = true, actionHighlight($event, true)"
            @blur="showLinkAction = false, actionHighlight($event, false)"
            @mouseover="showLinkAction = true, actionHighlight($event, true)" 
            @mouseout="showLinkAction = false, actionHighlight($event, false)">
          </i>
        </div>

        <field-adder ref="fieldAdder" class="ItemSibling-action"
          v-if="!isLocked" 
          :entity-type="item['@type']" 
          :allowed="allowedProperties" 
          :inner="true" 
          :path="getPath">
        </field-adder>
        <div class="ItemSibling-action RemoveAction">
          <i class="fa fa-trash-o fa-fw icon icon--sm" 
            v-if="!isLocked" 
            :class="{'show-icon': showActionButtons}"
            role="button"
            tabindex="0"
            :aria-label="'Remove' | translatePhrase"
            v-on:click="removeThis(true)"
            v-tooltip.top="translate('Remove')"
            @keyup.enter="removeThis(true)"
            @focus="removeHover = true, removeHighlight($event, true)" 
            @blur="removeHover = false, removeHighlight($event, false)"
            @mouseover="removeHover = true, removeHighlight($event, true)" 
            @mouseout="removeHover = false, removeHighlight($event, false)">
          </i>
        </div>
        <div class="ItemSibling-action">
          <div class="ItemSibling-placeHolder"></div>
        </div>
      </div>
    </strong>
  
    <ul class="ItemSibling-list js-itemLocalFields" v-show="expanded">
      <!-- <field-adder 
        v-if="!isLocked && isEmpty" 
        :entity-type="item['@type']" 
        :allowed="allowedProperties" 
        :inner="true" 
        :path="getPath"></field-adder> -->
      <field
        v-show="k !== '_uid'" 
        v-for="(v, k) in filteredItem" 
        :parent-path="getPath" 
        :entity-type="item['@type']" 
        :is-inner="true" 
        :is-locked="isLocked" 
        :is-removable="false" 
        :parent-key="fieldKey" 
        :parent-index="index" 
        :field-key="k" 
        :field-value="v" 
        :key="k" 
        :expand-children="expandChildren"
        :show-action-buttons="showActionButtons"></field>
    </ul>

    <search-window 
      :isActive="extractDialogActive" 
      :can-copy-title="canCopyTitle" 
      :copy-title="copyTitle" 
      :range-full="rangeFull"
      :range="range"
      :all-values-from="allValuesFrom"
      :some-values-from="someValuesFrom"
      :all-search-types="allSearchTypes"
      :entity-type="entityType" 
      :field-key="fieldKey" 
      :extracting="extracting" 
      :extractable="isExtractable"
      :item-info="extractedMainEntity"
      :index="index"
      @extract="extract"
      @replace-with="replaceWith"
      ></search-window>
    </div>


</template>

<style lang="less">

.ItemSibling {
  width: 100%;
  padding: 5px 0;
  position: relative;
  flex: 1 100%;
  transition: background-color .2s ease;
  border-radius: 4px;

  &-heading {
    display: block;
    flex: 1 100%;
    font-weight: normal;
    position: relative;

    .icon-hover();
  }

  &-label {
    &.is-locked {
      margin: 0;
    }
    margin-right: 120px;
    cursor: pointer;
    
    &.is-inactive {
      pointer-events: none;
    }
  }

  &-type {
  }

  &-arrow {
    transition: all 0.2s ease;
    padding: 0 2px;
    font-size: 14px;
    color: @grey-darker-transparent;

    .ItemSibling-label:hover & {
      color: @black;
    }
  }

  &-list {
    flex: 1 100%;
    position: relative;
    padding: 0 0 0 20px;

    .locked & {
      padding: 0 0 0 20px;
    }
  }

  &-actions {
    top: 0;
    right: 0;
    position: absolute;

    @media (max-width: @screen-sm) {
      display: flex;
      align-items: baseline;
    }
  }

  &-action {
    display: inline-block;
  }

  &-placeHolder {
    width: 20px;
  }

  &-collapsedLabel {
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;

    & .placeholder {
      visibility: hidden;
    }
  }

  &.is-marked {
    background-color: @form-mark;
  }
  
  &.is-removeable {
    background-color: @form-remove;
  }

  &.is-expanded > 
  .ItemSibling-heading > 
  .ItemSibling-label >
  .ItemSibling-arrow {
    transform:rotate(90deg);

    &::before {
      vertical-align: sub;
    }
  }
}

.item-local-container {

  .link-indicator {
    padding: 0em 0.6em;
    background: green;
    display: flex;
    align-items: center;
    background: @grey-darker;
    color: @white;
    &.active {
      background: lighten(@grey-darker, 15%);
      cursor: pointer;
    }
  }
  &.is-highlighted {
    transition: 0s ease;
    transition-property: outline, box-shadow;
    outline: 2px solid @brand-primary;
    box-shadow: 0px 0px 1em 0px @brand-primary;
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
      display: flex;
      align-items: center;
      padding: 5px 0;
      background: @white;
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
