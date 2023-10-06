<script>
/*
  This component is used for the special case for when we want to show a sibling (ie a work in an instance)
  as an item-local in mainEntity. Most of the functionality is similar to those in item-local, but with some
  important differences. Examples of this is the path-variables as they are pointing to one place for what data to show,
  and to another for what data to edit.
*/

import { mapActions, mapState } from 'pinia';
import { useResourcesStore } from '@/stores/resources';
import { useInspectorStore } from '@/stores/inspector';
import { useSettingsStore } from '@/stores/settings';
import { useUserStore } from '@/stores/user';
import { cloneDeep, each } from 'lodash-es';
import * as LxlDataUtil from 'lxljs/data';
import * as StringUtil from 'lxljs/string';
import * as LayoutUtil from '@/utils/layout';
import ItemMixin from '@/components/mixins/item-mixin.vue';
import LensMixin from '@/components/mixins/lens-mixin.vue';
import FormMixin from '@/components/mixins/form-mixin.vue';
import PropertyAdder from '@/components/inspector/property-adder.vue';
import SearchWindow from '@/components/inspector/search-window.vue';
import EntityAction from '@/components/inspector/entity-action.vue';
import { useStatusStore } from '@/stores/status';

export default {
  name: 'item-sibling',
  mixins: [FormMixin, ItemMixin, LensMixin],
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
    key: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      inEdit: false,
      showCardInfo: false,
      isNewlyAdded: false,
      extractDialogActive: false,
      propertyAdderOpened: false,
      expanded: false,
      focused: false,
      isHovered: false,
      removeHover: false,
      showLinkAction: false,
      copyTitle: false,
      expandChildren: false,
      highlights: [],
    };
  },
  computed: {
    ...mapState(useResourcesStore, ['i18n']),
    ...mapState(useInspectorStore, ['inspector']),
    ...mapState(useUserStore, ['user']),
    ...mapState(useSettingsStore, ['settings']),
    isSpecialHeading() {
      return this.path === 'mainEntity.instanceOf';
    },
    largerActions() {
      if (this.isSpecialHeading && this.expanded === true) {
        return true;
      }
      return false;
    },
    item() {
      const item = cloneDeep(this.inspector.data[this.fragmentId]);
      if (typeof item === 'undefined' || item === null) {
        this.pushNotification({
          type: 'danger',
          message: `${StringUtil.getUiPhraseByLang('Data is missing a reference, please verify file', this.user.settings.language, this.resources.i18n)}`,
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
    isExtracting() {
      if (Object.keys(this.inspector.extractItemsOnSave).includes(this.path)) {
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
    ...mapActions(useStatusStore, ['pushNotification']),
    ...mapActions(useInspectorStore, ['addToQuoted', 'updateInspectorData', 'setInspectorStatusValue', 'addExtractItemOnSave', 'removeExtractItemOnSave']),
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
      this.updateInspectorData({
        addToHistory: true,
        changeList: changeList,
      });
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
      this.addExtractItemOnSave({ path: this.path, item: this.focusData });
      this.pushNotification({
        type: 'success',
        message: `${StringUtil.getUiPhraseByLang('Link was created', this.user.settings.language, this.resources.i18n)}`
      });

      this.closeExtractDialog();
    },
    stopExtracting() {
      this.removeExtractItemOnSave({ path: this.path });
      this.closeExtractDialog();
    },
    checkFocus() {
      if (this.focused) {
        this.toggleExpanded();
      }
    },
    replaceWith(value) {
      const newValue = { '@id': value['@id'] };
      this.addToQuoted(value);
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
      this.updateInspectorData({
        addToHistory: true,
        changeList: changeList,
      });
      this.pushNotification({
        type: 'success',
        message: `${StringUtil.getUiPhraseByLang('Linking was successful', this.user.settings.language, this.resources.i18n)}`
      });
      this.setInspectorStatusValue({
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
    'inspector.status.editing'(val) {
      if (!val) {
        this.closePropertyAdder();
        this.stopExtracting();
      }
    },
    shouldExpand(val) {
      if (val) {
        this.expand();
        this.expandChildren = true;
      }
    },
    extractDialogActive(val) {
      if (!val && this.inspector.status.editing) {
        this.$refs.linkAction.$el.focus();
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
    if (this.settings.defaultExpandedProperties.includes(this.fieldKey)) {
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
        fieldAdder.$refs.adderButton.focus();
      } else {
        this.expand();
        this.expandAllChildren();
      }
      setTimeout(() => {
        if (this.isLastAdded) {
          this.setInspectorStatusValue({ property: 'lastAdded', value: '' });
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
    'search-window': SearchWindow,
    'property-adder': PropertyAdder,
    'entity-action': EntityAction,
  },
};
</script>

<template>
  <div class="ItemSibling js-itemLocal"
    ref="container"
    :id="`formPath-${path}`"
    :class="{'is-extracting': isExtracting, 'is-highlighted': isNewlyAdded, 'highlight-info': highlights.indexOf('info') > -1, 'highlight-remove': highlights.indexOf('remove') > -1, 'is-expanded': expanded && !isEmpty, 'is-extractable': isExtractable}"
    :tabindex="isEmpty ? -1 : 0"
    @keyup.enter="checkFocus()" 
    @focus="addFocus()"
    @blur="removeFocus()">

    <div class="ItemSibling-heading" ref="heading"
      @mouseover="isHovered = true"
      @mouseout="isHovered = false"
    >
      <div class="ItemSibling-label"
        :class="{'is-inactive': isEmpty, 'is-locked': isLocked }"
        @click="toggleExpanded()">
        <i class="ItemSibling-arrow fa fa-chevron-right" :class="{'icon is-disabled' : isEmpty}"></i>
        <span class="ItemSibling-type"
          :title="item['@type']">{{ capitalize(labelByLang(item['@type'])) }}:</span>
        <span class="ItemSibling-collapsedLabel" v-show="!expanded || isEmpty">
          {{getItemLabel}}
        </span>
      </div>
      
      <div class="ItemSibling-actions">
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
          v-if="!isLocked && !isExtracting"
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
          v-if="inspector.status.editing && !isLocked && !isExtracting"
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
          :placeholder="true"
        />
      </div>
    </div>
  
    <ul class="ItemSibling-list js-itemLocalFields" v-show="expanded">
      <field
        v-show="k !== '_uid'" 
        v-for="(v, k) in filteredItem" 
        :parent-path="getPath" 
        :entity-type="item['@type']" 
        :is-inner="true" 
        :is-locked="isLocked || isExtracting" 
        :is-removable="false" 
        :parent-key="fieldKey" 
        :parent-index="index" 
        :field-key="k" 
        :field-value="v" 
        :key="k" 
        :expand-children="expandChildren"
        :show-action-buttons="showActionButtons"></field>
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
      :extracting="extracting" 
      :extractable="isExtractable"
      :item-info="extractedMainEntity"
      :index="index"
      @extract="extract"
      @replace-with="replaceWith"
    />
    </div>
</template>

<style lang="scss">

.ItemSibling {
  width: 100%;
  min-width: 0;
  padding: 0;
  position: relative;
  flex: 1 100%;
  border-radius: 4px;

  &.highlight-info {
    .is-stuck, .is-sticky {
      background-color: $form-mark;
    }
  }
  &.highlight-remove {
    .is-stuck, .is-sticky {
      background-color: $form-remove;
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

    @include icon-hover();
  }

  &.highlight-info {
    background-color: $form-mark;
  }
  &.highlight-remove {
    background-color: $form-remove;
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
    color: $grey-darker-transparent;

    .ItemLocal-label:hover & {
      color: $black
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
        color: $grey-darker;
      }

    }
    &-menuLink {
      cursor: pointer;
      & svg {
        margin-right: 5px;
      }
    }
  }

  &-action {
    display: inline-block;
  }

  &.is-marked {
    background-color: $form-mark;
  }
  
  &.is-removeable {
    background-color: $form-remove;
  }

  &.is-expanded > 
  .ItemLocal-heading >
  .ItemLocal-label > 
  .ItemLocal-arrow {
    transform:rotate(90deg);
    transform-origin: center;
  }

  &.is-highlighted {
    background-color: $form-highlight;
  }
}

</style>
