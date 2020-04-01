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
import ToolTipComponent from '../shared/tooltip-component';
import FieldAdder from '@/components/inspector/field-adder';
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
      extracting: false,
      expanded: false,
      removeHover: false,
      managerMenuOpen: false,
      manageHover: false,
      showLinkAction: false,
      copyTitle: false,
      expandChildren: false,
      cloned: false,
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
    actionHighlight(active, event) {
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
    removeHighlight(active, event) {
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
    isHolding() {
      return this.inspector.data.mainEntity['@type'] === 'Item';
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
    'tooltip-component': ToolTipComponent,
    'search-window': SearchWindow,
  },
};
</script>

<template>
  <div class="ItemLocal js-itemLocal"
    :id="`formPath-${path}`"
    :class="{'is-highlighted': isLastAdded, 'is-expanded': expanded && !isEmpty, 'is-extractable': isExtractable, 'has-failed-validations': failedValidations.length > 0 }"
    :tabindex="isEmpty ? -1 : 0"
    @keyup.enter="checkFocus()"
    @focus="addFocus()"
    @blur="removeFocus()">

    <strong class="ItemLocal-heading">
      <div class="ItemLocal-label"
        :class="{'is-inactive': isEmpty, 'is-locked': isLocked }"
        @click="toggleExpanded()">
        <i class="ItemLocal-arrow fa fa-chevron-right" 
          :class="{'icon is-disabled' : isEmpty}"></i>
        <span class="ItemLocal-type"
          :title="item['@type']">{{ item['@type'] | labelByLang | capitalize }}:</span>
        <span class="ItemLocal-collapsedLabel">
          <span class="ItemLocal-collapsedText" v-show="!expanded || isEmpty">{{getItemLabel}}</span>
          <span class="placeholder"> </span>
        </span>
      </div>
      
      <div class="ItemLocal-actions">
        <div class="ItemLocal-action LinkAction">
          <i class="fa fa-link fa-fw icon icon--sm"
            v-if="!isLocked && !isEmbedded && !isCompositional"
            role="button"
            tabindex="0"
            :aria-label="'Link entity' | translatePhrase"
            @click="openExtractDialog(), expand()" 
            @focus="showLinkAction = true, actionHighlight(true, $event)"
            @blur="showLinkAction = false, actionHighlight(false, $event)"
            @mouseover="showLinkAction = true, actionHighlight(true, $event)" 
            @mouseout="showLinkAction = false, actionHighlight(false, $event)"
            @keyup.enter="openExtractDialog(), expand()">
            <tooltip-component 
              :show-tooltip="showLinkAction" 
              tooltip-text="Link entity"></tooltip-component>
          </i>
        </div>

        <field-adder ref="fieldAdder" class="ItemLocal-action"
          v-if="!isLocked" 
          :entity-type="item['@type']" 
          :allowed="allowedProperties" 
          :inner="true" 
          :path="getPath">
        </field-adder>

        <div class="ItemLocal-action RemoveAction">
          <i class="fa fa-trash-o fa-fw icon icon--sm"
            v-if="!isLocked" 
            :class="{'show-icon': showActionButtons}"
            role="button"
            tabindex="0"
            :aria-label="'Remove' | translatePhrase"
            v-on:click="removeThis(true)" 
            @keyup.enter="removeThis(true)"
            @focus="removeHover = true, removeHighlight(true, $event)"
            @blur="removeHover = false, removeHighlight(false, $event)"
            @mouseover="removeHover = true, removeHighlight(true, $event)"
            @mouseout="removeHover = false, removeHighlight(false, $event)">
            <tooltip-component 
              :show-tooltip="removeHover" 
              tooltip-text="Remove"></tooltip-component>
          </i>
        </div>

        <div class="ItemLocal-action OptionAction">
          <i class="icon icon--sm fa fa-fw fa-ellipsis-v"
            v-if="!isLocked"
            :class="{'show-icon': showActionButtons}" 
            role="button"
            tabindex="0"
            :aria-label="'Manage' | translatePhrase"
            v-on:click="managerMenuOpen ? closeManagerMenu() : openManagerMenu()" 
            @keyup.enter="managerMenuOpen ? closeManagerMenu() : openManagerMenu()"
            @focus="manageHover = true, actionHighlight(true, $event)"
            @blur="manageHover = false, actionHighlight(false, $event)"
            @mouseover="manageHover = true, actionHighlight(true, $event)"
            @mouseout="manageHover = false, actionHighlight(false, $event)">
            <tooltip-component 
              :show-tooltip="manageHover" 
              tooltip-text="Manage"></tooltip-component>
          </i>
        </div>
        <div class="dropdown ManagerMenu" v-on-clickaway="closeManagerMenu" v-if="managerMenuOpen"
          @mouseover="actionHighlight(true, $event)"
          @mouseout="actionHighlight(false, $event)">
          <ul class="dropdown-menu ManagerMenu-menuList">
            <li class="ManagerMenu-menuItem">
              <a tabindex="0" class="ManagerMenu-menuLink"
              @focus="actionHighlight(true, $event)"
              @keyup.enter="copyThis(), closeManagerMenu(), actionHighlight(false, $event)"
              @click="copyThis(), closeManagerMenu(), actionHighlight(false, $event)">
              <i class="fa fa-fw fa-copy" aria-hidden="true"></i>
              {{"Copy to clipboard" | translatePhrase}}
              </a>
            </li>
            <li class="ManagerMenu-menuItem" v-if="inArray">
              <a tabindex="0" class="ManagerMenu-menuLink"
              @focus="actionHighlight(true, $event)"
              @keyup.enter="cloneThis(), closeManagerMenu(), actionHighlight(false, $event)"
              @click="cloneThis(), closeManagerMenu(), actionHighlight(false, $event)">
              <i class="fa fa-fw fa-clone" aria-hidden="true"></i>
              {{"Duplicate entity" | translatePhrase}}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </strong>
  
    <ul class="ItemLocal-list js-itemLocalFields" v-show="expanded">
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
        :as-columns="false" 
        :parent-key="fieldKey" 
        :parent-index="index" 
        :field-key="k"
        :field-value="v"
        :key="k" 
        :show-action-buttons="showActionButtons"
        :expand-children="expandChildren"
        :is-expanded="expanded"></field> 
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
      :extractable="isExtractable"
      :extracting="extracting" 
      :item-info="extractedMainEntity"
      :index="index"
      @extract="extract"
      @replace-with="replaceWith"></search-window>
    </div>
</template>

<style lang="less">
.ItemLocal {
  width: 100%;
  padding: 5px 0;
  position: relative;
  flex: 1 100%;
  transition: background-color .5s ease;
  border-radius: 4px;  

  &.has-failed-validations {
    outline: 1px dotted red;
  }

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
    top: 0;
    right: 0;
    position: absolute;

    @media (max-width: @screen-sm) {
      display: flex;
      align-items: baseline;
    }
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

  &-collapsedLabel {
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 40px;

    & .placeholder {
      visibility: hidden;
    }
  }

  &-collapsedText {
    display: inline;
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
