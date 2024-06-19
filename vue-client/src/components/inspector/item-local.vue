<script>
import { cloneDeep, get } from 'lodash-es';
import { vOnClickOutside } from '@vueuse/components';
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
import * as DisplayUtil from 'lxljs/display';
import * as StringUtil from 'lxljs/string';
import * as LayoutUtil from '@/utils/layout';
import { translatePhrase, labelByLang, capitalize } from '@/utils/filters';
import PropertyAdder from '@/components/inspector/property-adder.vue';
import EntityAction from '@/components/inspector/entity-action.vue';
import SearchWindow from './search-window.vue';
import ItemMixin from '../mixins/item-mixin.vue';
import LensMixin from '../mixins/lens-mixin.vue';
import FormMixin from '../mixins/form-mixin.vue';
import IdPill from "@/components/shared/id-pill.vue";

export default {
  name: 'item-local',
  directives: {
    'on-click-outside': vOnClickOutside,
  },
  mixins: [ItemMixin, LensMixin, FormMixin],
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
    editingObject: {
      type: String,
      default: '',
    },
    key: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      inEdit: false,
      showCardInfo: false,
      extractDialogActive: false,
      propertyAdderOpened: false,
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
        this.resources,
        this.inspector.data.quoted,
        this.settings,
        this.focusData['@type'],
      );
    },
    failedValidations() {
      const failedValidations = [];
      if (this.user.settings.appTech === false) {
        return failedValidations;
      }

      const termObj = VocabUtil.getTermObject(this.focusData['@type'], this.resources.vocab, this.resources.context);
      if (termObj == {} || typeof termObj === 'undefined') {
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
    canAddId() {
      if (this.fieldKey === 'hasComponent' && this.isHolding && !this.hasId) {
        return true;
      }
      return false;
    },
    hasId() {
      return this.item.hasOwnProperty('@id');
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
    isExtracting() {
      if (this.inspector.extractItemsOnSave.includes(this.path)) {
        return true;
      }
      return false;
    },
  },
  methods: {
    translatePhrase,
    labelByLang,
    capitalize,
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
    addHoverHightlight() {
      if (!this.isHistoryView() && !this.isLocked) {
        this.addHighlight('mark');
      }
    },
    addHighlight(type) {
      this.highlights.push(type);
    },
    removeHoverHightlight() {
      if (!this.isHistoryView() && !this.isLocked) {
        this.removeHighlight('mark');
      }
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
    isHistoryView() {
      return this.diff !== null;
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
      this.$store.dispatch('addExtractItemOnSave', { path: this.path, item: this.focusData });
      this.closeExtractDialog();
    },
    stopExtracting() {
      this.$store.dispatch('removeExtractItemOnSave', { path: this.path });
      this.closeExtractDialog();
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
        addToHistory: true,
      });
      this.$store.dispatch('pushNotification', { type: 'success', message: `${StringUtil.getUiPhraseByLang('Linking was successful', this.user.settings.language, this.resources.i18n)}` });
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
      this.$store.dispatch(
        'pushNotification',
        { type: 'success',
          message: `${StringUtil.getUiPhraseByLang('Copied entity to clipboard', this.user.settings.language, this.resources.i18n)}` },
      );
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
    addId() {
      if (this.canAddId) {
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: `${this.path}.@id`,
              value: '',
            },
          ],
          addToHistory: true,
        });
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'lastAdded',
          value: `${this.path}.@id`,
        });
      }
    },
  },
  watch: {
    'inspector.status.editing'(val) {
      if (!val) {
        this.closePropertyAdder();
        this.stopExtracting();
      }
    },
    'inspector.event'(val) {
      if (val.name === 'form-control') {
        switch (val.value) {
          case 'collapse-item':
            if (this.getPath.startsWith(this.inspector.status.focus) // Only expand part of form that has focus
                || (this.getPath.startsWith('work') && this.inspector.status.focus === 'mainEntity')) {
              this.collapse();
            }
            break;
          case 'expand-item':
            if (this.getPath.startsWith(this.inspector.status.focus)
                || (this.getPath.startsWith('work') && this.inspector.status.focus === 'mainEntity')) {
              this.expand();
            }
            break;
          default:
        }
      }
    },
    shouldExpand(val) {
      if (val) {
        this.expand();
        this.expandChildren = true;
      }
    },
    diff() {
      if (this.isHistoryView()) {
        if (this.diffChangedChildren) {
          this.expand();
        } else {
          this.collapse();
        }
      }
    },
    extractDialogActive(val) {
      if (!val && this.inspector.status.editing) {
        this.$refs.linkAction.$el.focus();
      }
    },
    isExtracting(val) {
      if (val === false) {
        this.removeHighlight('info');
      }
    },
  },
  beforeUnmount() {
    this.$store.dispatch('setValidation', { path: this.path, validates: true });
  },
  created() {
    if (this.$store.state.settings.defaultExpandedProperties.includes(this.fieldKey)) {
      this.expand();
    }
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
        if (fieldAdder) {
          fieldAdder.$refs.adderButton.focus();
        }
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
    if (this.isHistoryView()) {
      if (this.diffChangedChildren) {
        this.expand();
      } else {
        this.collapse();
      }
    }
    if (this.inspector.status.isNew) {
      this.expand();
    }
  },

  components: {
    IdPill,
    'property-adder': PropertyAdder,
    'search-window': SearchWindow,
    'entity-action': EntityAction,
  },
};
</script>

<template>
  <div
    class="ItemLocal js-itemLocal"
    ref="container"
    :id="`formPath-${path}`"
    :class="{
      'is-highlighted': isLastAdded,
      'is-extracting': isExtracting,
      'highlight-mark': highlights.indexOf('mark') > -1,
      'highlight-remove': highlights.indexOf('remove') > -1,
      'highlight-info': highlights.indexOf('info') > -1,
      'is-expanded': expanded && !isEmpty,
      'is-entity': !isEmbedded,
      'is-extractable': isExtractable && !isEmbedded,
      'has-failed-validations': failedValidations.length > 0,
      'is-diff-removed': diffRemoved,
      'is-diff-added': diffAdded,
      'is-modified': diffModified,
    }"
    :tabindex="isEmpty ? -1 : 0"
    @keyup.enter="checkFocus()"
    @focus="addFocus()"
    @blur="removeFocus()"
    @mouseover.stop="addHoverHightlight()"
    @mouseout.stop="removeHoverHightlight()"
  >

    <div
      class="ItemLocal-heading"
      ref="heading"
      @mouseover="isHovered = true"
      @mouseout="isHovered = false"
    >
      <div
        class="ItemLocal-label"
        :class="{ 'is-inactive': isEmpty, 'is-locked': isLocked }"
        @click="toggleExpanded()">
        <i
          class="ItemLocal-arrow fa fa-chevron-right"
          :class="{ 'icon is-disabled': isEmpty }" />
        <span
          class="ItemLocal-type"
          :title="item['@type']">
          <span class="ItemLocal-extraction-label" v-if="isExtracting">
            <i class="fa fa-scissors" />
            {{ translatePhrase("The work is extracted once the instance is saved") }}
          </span>
          <span v-if="!expanded || !isExtracting">
            {{ capitalize(labelByLang(item['@type'])) }}:
          </span>
        </span>
        <span class="ItemLocal-collapsedLabel" v-show="!expanded || isEmpty">
          {{getItemLabel}}
        </span>
        <span class="ItemLocal-history-icon" v-if="diffRemoved && !diffAdded">
          <i class="fa fa-trash-o icon--sm icon-removed" />
        </span>
        <div class="ItemLocal-history-icon" v-if="diffAdded && !diffRemoved">
          <i class="fa fa-plus-circle icon--sm icon-added" />
        </div>
      </div>
      <id-pill
        v-if="this.hasId"
        :uri="this.recordId"
        :isLibrisResource="this.isLibrisResource"
      />

      <div class="ItemLocal-actions">
        <entity-action
          v-if="isExtracting"
          @action="stopExtracting()"
          @highlight="addHighlight('info')"
          @dehighlight="removeHighlight('info')"
          label="Cancel linking"
          description="Cancel linking"
          icon="unlink"
          :parent-hovered="isHovered"
          :is-large="largerActions"
        />
        <entity-action
          v-if="inspector.status.editing && !isEmbedded && !isLocked && !isCompositional && extractedMainEntity != null && !isExtracting"
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
          v-if="!isLocked"
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
          v-if="inspector.status.editing && !isLocked"
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
          v-if="inspector.status.editing && !isLocked"
          @action="managerMenuOpen ? closeManagerMenu() : openManagerMenu()"
          @highlight="addHighlight('info')"
          @dehighlight="removeHighlight('info')"
          label="Manage"
          description="Manage"
          icon="ellipsis-v"
          :parent-hovered="isHovered"
          :is-large="false"
        />
        <div
          class="dropdown ManagerMenu"
          v-on-click-outside="closeManagerMenu"
          v-if="managerMenuOpen"
          @mouseover="addHighlight('info')"
          @mouseout="removeHighlight('info')">
          <ul class="dropdown-menu ManagerMenu-menuList">
            <li class="ManagerMenu-menuItem">
              <a
                tabindex="0"
                class="ManagerMenu-menuLink"
                @keyup.enter="copyThis(), closeManagerMenu()"
                @click="copyThis(), closeManagerMenu()">
                <i class="fa fa-fw fa-copy" aria-hidden="true" />
                {{ translatePhrase("Copy to clipboard") }}
              </a>
            </li>
            <li class="ManagerMenu-menuItem" v-if="inArray">
              <a
                tabindex="0"
                class="ManagerMenu-menuLink"
                @keyup.enter="cloneThis(), closeManagerMenu()"
                @click="cloneThis(), closeManagerMenu()">
                <i class="fa fa-fw fa-clone" aria-hidden="true" />
                {{ translatePhrase("Duplicate entity") }}
              </a>
            </li>
            <li class="ManagerMenu-menuItem" v-if="canAddId">
              <a
                tabindex="0"
                class="ManagerMenu-menuLink"
                @keyup.enter="addId(), closeManagerMenu()"
                @click="addId(), closeManagerMenu()">
                <i class="fa fa-fw fa-plus" aria-hidden="true" />
                {{ translatePhrase("Create id for entity") }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <ul class="ItemLocal-list js-itemLocalFields" v-show="expanded">
      <field
        v-show="k !== '_uid'"
        v-for="(v, k, i) in filteredItem"
        :parent-path="getPath"
        :entity-type="item['@type']"
        :is-inner="true"
        :is-locked="isLocked"
        :is-removable="false"
        :is-first-field="i === 0"
        :parent-key="fieldKey"
        :parent-index="index"
        :parent-accepted-types="acceptedTypes"
        :field-key="k"
        :field-value="v"
        :key="k"
        :diff="diff"
        :expand-children="expandChildren"
        :is-expanded="expanded" />
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
      :entity-type="item['@type']"
      :field-key="fieldKey"
      :extracting="isExtracting"
      :extractable="isExtractable"
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
  min-width: 0;
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

  &.highlight-mark:not(.highlight-info):not(.highlight-remove) {
    background-color: @field-background-hover;
    border-color: @grey-light;
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
    display: flex;
    align-items: center;
    margin: 0 0.5rem;
    white-space: nowrap;
  }

  &-extraction-label {
    font-size: 1.3rem;
    color: @brand-primary;
    margin-right: 0.5em;
    font-weight: 600;
  }

  &-collapsedLabel {
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &-history-icon {
    padding: 2px 10px;
    margin-left: auto;
    margin-right: 0;
    display: block;
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

  &.is-entity {
    border-radius: 4px;
    padding: 0.5rem 1rem 0.5rem 1rem;
    margin: 0.6rem 0 0.6rem 0;
    border: 1px solid @grey-lighter;
    box-shadow: 0 2px 5px rgba(0,0,0,.08);
  }

  &.is-extractable {
    border: 1px solid @grey-lighter;
    box-shadow: 0 2px 5px rgba(0,0,0,.16);
    margin: 1rem 0 1rem 0;
  }
  &.is-diff-removed {
    @base-color: @remove;
    border: 1px dashed;
    border-color: @base-color;
    background-color: @form-remove;
  }

  &.is-diff-added {
    @base-color: @form-add;
    background-color: @base-color;
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

  &.is-extracting {
    background-color: @form-extracting !important;
    border: 1px dashed @brand-primary;
    
    &.highlight-mark {
      border-color: @brand-primary !important;
    }
  }

  &.is-extracting .is-entity {
    background: #fff;
  }
}
</style>
