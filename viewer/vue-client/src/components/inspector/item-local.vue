<script>
import { cloneDeep, get } from 'lodash-es';
import { mixin as clickaway } from 'vue-clickaway';
import { mapGetters } from 'vuex';
import * as httpUtil from '@/utils/http';
import * as LayoutUtil from '@/utils/layout';
import * as VocabUtil from '@/utils/vocab';
import * as RecordUtil from '@/utils/record';
import * as DisplayUtil from '@/utils/display';
import * as StringUtil from '@/utils/string';
import PropertyAdder from '@/components/inspector/property-adder';
import EntityAction from '@/components/inspector/entity-action';
import SearchWindow from './search-window';
import ItemMixin from '../mixins/item-mixin';
import LensMixin from '../mixins/lens-mixin';
import FormMixin from '../mixins/form-mixin';

export default {
  name: 'item-local',
  mixins: [ItemMixin, LensMixin, FormMixin, clickaway],
  props: {
    item: {},
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
    inArray: {
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
    shouldExpand: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      inEdit: false,
      showCardInfo: false,
      extractDialogActive: false,
      propertyAdderOpened: false,
      extracting: false,
      expanded: false,
      removeHover: false,
      focused: false,
      isHovered: false,
      managerMenuOpen: false,
      manageHover: false,
      showLinkAction: false,
      copyTitle: false,
      expandChildren: false,
      cloned: false,
      highlights: [],
    };
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'settings',
      'user',
      'status',
      'userStorage',
    ]),
    isSpecialHeading() {
      return this.path === 'mainEntity.instanceOf';
    },
    largerActions() {
      if (this.isSpecialHeading && this.expanded === true) {
        return true;
      }
      return false;
    },
    getItemLabel() {
      return DisplayUtil.getItemLabel(
        this.focusData,
        this.resources.display,
        this.inspector.data.quoted,
        this.resources.vocab,
        this.settings,
        this.resources.context,
        this.focusData['@type'],
      );
    },
    failedValidations() {
      const failedValidations = [];
      if (this.user.settings.appTech === false) {
        return failedValidations;
      }

      const termObj = VocabUtil.getTermObject(this.focusData['@type'], this.resources.vocab, this.resources.context);
      if (termObj === {} || typeof termObj === 'undefined') {
        failedValidations.push({
          text: 'The class could not be found',
          hint: this.focusData['@type'],
        });
      } else if (termObj.abstract === true) {
        failedValidations.push({
          text: 'The class is abstract and should not be used',
          hint: this.focusData['@type'],
        });
      } else if (this.rangeFull.indexOf(this.focusData['@type']) === -1) {
        failedValidations.push({
          text: 'The class is not in the range of this property',
          hint: `${this.fieldKey} <- ${this.focusData['@type']}`,
        });
      }

      if (failedValidations.length > 0) {
        this.$store.dispatch('setValidation', { path: this.path, validates: false, reasons: failedValidations });
      } else {
        this.$store.dispatch('setValidation', { path: this.path, validates: true });
      }
      return failedValidations;
    },
    canCopyTitle() {
      if (this.isExtractable && !this.item.hasOwnProperty('hasTitle') && this.key === 'instanceOf') {
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
    formObj() {
      return this.item;
    },
    isEmpty() {
      const itemKeys = Object.keys(this.item);
      if (itemKeys.length > 1) {
        return false;
      }
      if (itemKeys.length === 1 && this.showTypeChanger) {
        return false;
      }
      return true;
    },
    isLastAdded() {
      if (this.inspector.status.lastAdded === this.getPath) {
        return true;
      }
      return false;
    },
  },
  methods: {
    openManagerMenu() {
      this.managerMenuOpen = true;
    },
    closeManagerMenu() {
      this.managerMenuOpen = false;
    },
    highLightLastAdded() {
      const element = this.$el;
      LayoutUtil.ensureInViewport(element);
    },
    addHighlight(type) {
      this.highlights.push(type);
    },
    removeHighlight(type) {
      this.highlights.splice(this.highlights.indexOf(type));
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
    isHolding() {
      return this.inspector.data.mainEntity['@type'] === 'Item';
    },
    openPropertyAdder() {
      if (this.inspector.status.editing) {
        this.propertyAdderOpened = true;
      }
    },
    closePropertyAdder() {
      if (this.inspector.status.editing) {
        this.propertyAdderOpened = false;
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
            this.$store.dispatch('pushNotification', { 
              type: 'danger', 
              message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)} - ${error}`,
            });
            this.closeExtractDialog();
          });
        } else {
          this.$store.dispatch('pushNotification', { 
            type: 'danger', 
            message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)}`,
          });
          this.closeExtractDialog();
        }
      }, (error) => {
        this.$store.dispatch('pushNotification', { 
          type: 'danger', 
          message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)} - ${error}`,
        });
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
      this.closeManagerMenu();
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
      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: `${this.path}`,
            value: newValue,
          },
        ],
        addToHistory: false,
      });
      this.$store.dispatch('pushNotification', { type: 'success', message: `${StringUtil.getUiPhraseByLang('Linking was successful', this.user.settings.language)}` });
      this.$store.dispatch('setInspectorStatusValue', { 
        property: 'lastAdded', 
        value: `${this.parentPath}.{"@id":"${newValue['@id']}"}`,
      });
      this.closeExtractDialog();
    },
    cloneThis() {      
      const parentData = cloneDeep(get(this.inspector.data, this.parentPath));
      parentData.push(this.item);

      this.$store.dispatch('setInspectorStatusValue', { 
        property: 'lastAdded', 
        value: `${this.parentPath}[${parentData.length - 1}]`,
      });

      setTimeout(() => {
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: this.parentPath,
              value: parentData,
            },
          ],
          addToHistory: true,
        });
      }, 500);
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
    copyThis() {
      const userStorage = cloneDeep(this.userStorage);
      userStorage.copyClipboard = this.item;
      this.$store.dispatch('setUserStorage', userStorage);
      this.$store.dispatch('pushNotification', { type: 'success', message: `${StringUtil.getUiPhraseByLang('Copied entity to clipboard', this.user.settings.language)}` });
    },
    attachHeadingStickyFunctionality() {
      document.addEventListener('scroll', () => {
        const scrolled = document.scrollingElement.scrollTop;
        const heading = this.$refs.heading;
        const container = this.$refs.container;
        if (!heading || !container) return;
        const position = LayoutUtil.getPosition(container).y;
        const searchBarHeight = document.getElementById('SearchBar').offsetHeight;
        heading.style.top = `${searchBarHeight}px`;

        if (scrolled > position - searchBarHeight) {
          heading.classList.add('is-stuck');
        } else {
          heading.classList.remove('is-stuck');
        }
      });
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
    extractDialogActive(val) {
      if (!val) {
        this.$refs.linkAction.$el.focus();
      }
    },
  },
  beforeDestroy() {
    this.$store.dispatch('setValidation', { path: this.path, validates: true });
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
    if (this.isSpecialHeading) {
      this.attachHeadingStickyFunctionality();
    }
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
    'property-adder': PropertyAdder,
    'search-window': SearchWindow,
    'entity-action': EntityAction,
  },
};
</script>

<template>
  <div class="ItemLocal js-itemLocal"
    ref="container"
    :id="`formPath-${path}`"
    :class="{'is-highlighted': isLastAdded, 'highlight-info': highlights.indexOf('info') > -1, 'highlight-remove': highlights.indexOf('remove') > -1, 'is-expanded': expanded && !isEmpty, 'is-extractable': isExtractable, 'has-failed-validations': failedValidations.length > 0 }"
    :tabindex="isEmpty ? -1 : 0"
    @keyup.enter="checkFocus()"
    @focus="addFocus()"
    @blur="removeFocus()">

    <div class="ItemLocal-heading" ref="heading"
      @mouseover="isHovered = true"
      @mouseout="isHovered = false"
    >
      <div class="ItemLocal-label"
        :class="{'is-inactive': isEmpty, 'is-locked': isLocked }"
        @click="toggleExpanded()">
        <i class="ItemLocal-arrow fa fa-chevron-right" 
          :class="{'icon is-disabled' : isEmpty}"></i>
        <span class="ItemLocal-type"
          :title="item['@type']">{{ item['@type'] | labelByLang | capitalize }}:</span>
        <span class="ItemLocal-collapsedLabel" v-show="!expanded || isEmpty">
          {{getItemLabel}}
        </span>
      </div>
      
      <div class="ItemLocal-actions">
        <entity-action
          v-if="inspector.status.editing && !isEmbedded && !isLocked"
          @action="openExtractDialog(), expand()"
          @highlight="addHighlight('info')"
          @dehighlight="removeHighlight('info')"
          label="Create/link"
          description="Create/link"
          icon="link"
          ref="linkAction"
          :parent-hovered="isHovered"
          :is-large="largerActions"
        />

        <entity-action
          v-if="!isLocked && !isCompositional"
          @action="openPropertyAdder(), expand()"
          @highlight="addHighlight('info')"
          @dehighlight="removeHighlight('info')"
          label="Property"
          description="Add property"
          icon="plus-circle"
          :parent-hovered="isHovered"
          :is-large="largerActions"
        />

        <entity-action
          v-if="!isLocked"
          @action="removeThis(true)"
          @highlight="addHighlight('remove')"
          @dehighlight="removeHighlight('remove')"
          label="Remove"
          description="Remove"
          icon="trash-o"
          :parent-hovered="isHovered"
          :is-large="false"
        />

        <entity-action
          v-if="!isLocked"
          @action="managerMenuOpen ? closeManagerMenu() : openManagerMenu()"
          @highlight="addHighlight('info')"
          @dehighlight="removeHighlight('info')"
          label="Manage"
          description="Manage"
          icon="ellipsis-v"
          :parent-hovered="isHovered"
          :is-large="false"
        />
        <div class="dropdown ManagerMenu" v-on-clickaway="closeManagerMenu" v-if="managerMenuOpen"
          @mouseover="addHighlight('info')"
          @mouseout="removeHighlight('info')">
          <ul class="dropdown-menu ManagerMenu-menuList">
            <li class="ManagerMenu-menuItem">
              <a tabindex="0" class="ManagerMenu-menuLink"
              @keyup.enter="copyThis(), closeManagerMenu()"
              @click="copyThis(), closeManagerMenu()">
              <i class="fa fa-fw fa-copy" aria-hidden="true"></i>
              {{"Copy to clipboard" | translatePhrase}}
              </a>
            </li>
            <li class="ManagerMenu-menuItem" v-if="inArray">
              <a tabindex="0" class="ManagerMenu-menuLink"
              @keyup.enter="cloneThis(), closeManagerMenu()"
              @click="cloneThis(), closeManagerMenu()">
              <i class="fa fa-fw fa-clone" aria-hidden="true"></i>
              {{"Duplicate entity" | translatePhrase}}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  
    <ul class="ItemLocal-list js-itemLocalFields" v-show="expanded">
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
        :show-action-buttons="showActionButtons"
        :expand-children="expandChildren"
        :is-expanded="expanded"></field> 
    </ul>

    <property-adder
      :entity-type="item['@type']" 
      :allowed="allowedProperties" 
      :isActive="propertyAdderOpened"
      :path="getPath"
    />

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
      :extractable="isExtractable"
      :extracting="extracting" 
      :item-info="extractedMainEntity"
      :index="index"
      @extract="extract"
      @replace-with="replaceWith"
    />
  </div>
</template>

<style lang="less">
.ItemLocal {
  width: 100%;
  padding: 0;
  position: relative;
  flex: 1 100%;
  border-radius: 4px;

  &.highlight-info {
    .is-stuck, .is-sticky {
      background-color: @form-mark;
    }
  }
  &.highlight-remove {
    .is-stuck, .is-sticky {
      background-color: @form-remove;
    }
  }

  &-heading {
    display: flex;
    align-items: center;
    height: 2.5em;
    width: 100%;
    font-weight: normal;
    background-color: inherit;
    box-shadow: 0px 6px 5px -5px rgba(0, 0, 0, 0);
    transition: box-shadow 0.25s ease;
    z-index: 850;
    &.is-stuck, &.is-sticky {
      box-shadow: 0px 6px 5px -5px #0000002b;
      position: sticky;
      background-color: #fff;
    }
    .icon-hover();
  }

  &.highlight-info {
    background-color: @form-mark;
  }
  &.highlight-remove {
    background-color: @form-remove;
  }

  &.has-failed-validations {
    outline: 1px dotted red;
  }

  &-label {
    &.is-locked {
      margin: 0;
    }
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-grow: 1;
    overflow: hidden;

    &.is-inactive {
      pointer-events: none;
    }
  }

  &-type {
    margin: 0 0.5rem;
    white-space: nowrap;
  }


  &-collapsedLabel {
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &-collapsedText {
    display: inline;
  }

  &-arrow {
    transition: all 0.2s ease;
    padding: 0 2px;
    font-size: 14px;
    color: @grey-darker-transparent;

    .ItemLocal-label:hover & {
      color: @black
    }
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
    div:not(:first-child) {
      margin-left: 0.4rem;
    }
    display: flex;
    align-items: baseline;
  }

  .ManagerMenu {
    li > a {
      cursor: pointer;
      padding: 3px 5px;
    }
    &-menuList {
      display: block;
      padding: 5px 0;
    }
    &-menuItem {
      & a {
        display: flex;
        align-items: center;
        padding: 5px 15px;
        color: @grey-darker;
      }

    }
    &-menuLink {
      cursor: pointer;
      & i {
        margin-right: 5px;
      }
    }
  }

  &-action {
    display: inline-block;
  }

  &.is-marked {
    background-color: @form-mark;
  }
  
  &.is-removeable {
    background-color: @form-remove;
  }

  &.is-expanded > 
  .ItemLocal-heading >
  .ItemLocal-label > 
  .ItemLocal-arrow {
    transform:rotate(90deg);
    transform-origin: center;
  }

  &.is-highlighted {
    background-color: @form-highlight;
  }
}
</style>
