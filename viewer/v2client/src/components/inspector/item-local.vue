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
import FormMixin from '../mixins/form-mixin';
import {mixin as clickaway} from 'vue-clickaway';
import { mapGetters } from 'vuex';

export default {
  name: 'item-local',
  mixins: [ItemMixin, LensMixin, FormMixin, clickaway],
  props: {
    item: {},
    fieldKey: '',
    entityType: '',
    index: Number,
    isLocked: false,
    showActionButtons: false,
    parentPath: '',
    inArray: false,
    parentRange: {
      type: Array,
      default: () => [],
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
      cloneHover: false,
      showLinkAction: false,
      copyTitle: false,
      cloned: false
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
    failedValidations() {
      const failedValidations = [];
      if (this.user.settings.appTech === false) {
        return failedValidations;
      }

      const termObj = VocabUtil.getTermObject(this.focusData['@type'], this.resources.vocab, this.resources.context);
      if (termObj === {} || typeof termObj === 'undefined') {
        failedValidations.push({
          text: "The class could not be found",
          hint: this.focusData['@type']
        });
      } else {
        if (termObj.abstract === true) {
          failedValidations.push({
            text: "The class is abstract and should not be used",
            hint: this.focusData['@type']
          });
        } else if (this.parentRange.indexOf(this.focusData['@type']) == -1) {
          failedValidations.push({
            text: "The class is not in the range of this property",
            hint: `${this.fieldKey} <- ${this.focusData['@type']}`
          });
        }
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
      if (this.forcedExtractability === true) {
        return false;
      } else if (this.forcedExtractability === false) {
        return true;
      }
      const classId = StringUtil.getCompactUri(this.item['@type'], this.resources.context);
      if (VocabUtil.isExtractable(classId, this.resources.vocab, this.settings, this.resources.context)) {
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
    isLastAdded() {
      if (this.inspector.status.lastAdded === this.getPath) {
        return true;
      }
      return false;
    },
  },
  methods: {
    highLightLastAdded() {
      let element = this.$el;
      LayoutUtil.scrollToElement(element, 1000, () => {
        setTimeout(() => {
          this.$store.dispatch('setInspectorStatusValue', { property: 'lastAdded', value: '' });
        }, 1000);
      });
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
            this.replaceWith(mainEntity);
            this.closeExtractDialog();
          }, (error) => {
            this.$store.dispatch('pushNotification', { 
              type: 'danger', 
              message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error}`
            });
            this.closeExtractDialog();
          });
        } else {
          this.$store.dispatch('pushNotification', { 
            type: 'danger', 
            message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error}`
          });
          this.closeExtractDialog();
        }
      }, (error) => {
        this.$store.dispatch('pushNotification', { 
          type: 'danger', 
          message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error}`
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
          }
        ],
        addToHistory: false,
      });
      this.$store.dispatch('pushNotification', { type: 'success', message: `${StringUtil.getUiPhraseByLang('Linking was successful', this.settings.language)}` });
      this.$store.dispatch('setInspectorStatusValue', { 
        property: 'lastAdded', 
        value: `${this.parentPath}.{"@id":"${newValue['@id']}"}`
      });
      this.closeExtractDialog();
    },
    cloneThis() {      
      let parentData = _.cloneDeep(_.get(this.inspector.data, this.parentPath));
      parentData.push(this.item);

      this.$store.dispatch('setInspectorStatusValue', { 
        property: 'lastAdded', 
        value: `${this.parentPath}[${parentData.length-1}]`
      });

      setTimeout(() => {
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: this.parentPath,
              value: parentData,
            }
          ],
          addToHistory: true,
        });
      }, 500);
    },
    expandOnNew() {
      if (this.inspector.status.isNew) {
        this.expand();
      }
    }
  },
  watch: {
    'inspector.event'(val, oldVal) {
      this.$emit(`${val.value}`);
    }
  },
  beforeDestroy() {
    this.$store.dispatch('setValidation', { path: this.path, validates: true });
  },
  created: function () {
    this.$on('collapse-item', this.collapse);
    this.$on('expand-item', this.expand);
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
        }
      setTimeout(() => {
        this.$store.dispatch('setInspectorStatusValue', { property: 'lastAdded', value: '' });
      }, 1000)
    } 
    this.expandOnNew();
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
    :class="{'is-highlighted': isLastAdded, 'is-expanded': expanded && !isEmpty, 'is-extractable': isExtractable, 'has-failed-validations': failedValidations.length > 0 }"
    :tabindex="isEmpty ? -1 : 0"
    @keyup.enter="checkFocus()"
    @focus="addFocus()"
    @blur="removeFocus()">

    <strong class="ItemLocal-heading">
      <div class="ItemLocal-label"
        :class="{'is-inactive': isEmpty}">
        <i class="ItemLocal-arrow fa fa-chevron-right" 
          :class="{'icon is-disabled' : isEmpty}"
          @click="toggleExpanded()"></i>
        <span class="ItemLocal-type" 
          @click="toggleExpanded($event)" 
          :title="item['@type']">{{ item['@type'] | labelByLang | capitalize }}:</span>
        <span class="ItemLocal-collapsedLabel" @click="toggleExpanded()">
          <span class="ItemLocal-collapsedText" v-show="!expanded || isEmpty">{{getItemLabel}}</span>
          <span class="placeholder"> </span>
        </span>
      </div>
      
      <div class="ItemLocal-actions">
        <div class="ItemLocal-action">
          <i class="fa fa-link icon icon--sm"
            v-if="inspector.status.editing && isExtractable"
            @click="openExtractDialog(), expand()" 
            @focus="showLinkAction = true, actionHighlight(true, $event)"
            @blur="showLinkAction = false, actionHighlight(false, $event)"
            @mouseover="showLinkAction = true, actionHighlight(true, $event)" 
            @mouseout="showLinkAction = false, actionHighlight(false, $event)"
            @keyup.enter="openExtractDialog(), expand()"
            tabindex="0">
            <tooltip-component 
              :show-tooltip="showLinkAction" 
              tooltip-text="Link entity" 
              translation="translatePhrase"></tooltip-component>
          </i>
        </div>

        <div class="ItemLocal-action" 
          v-if="!isLocked && inArray">
          <i class="fa fa-clone action-button icon icon--sm"
            tabindex="0"
            v-on:click="cloneThis(true)"
            @keyup.enter="cloneThis(true)"
            @focus="cloneHover = true, actionHighlight(true, $event)"
            @blur="cloneHover = false, actionHighlight(false, $event)"
            @mouseover="cloneHover = true, actionHighlight(true, $event)" 
            @mouseout="cloneHover = false, actionHighlight(false, $event)">
            <tooltip-component 
              :show-tooltip="cloneHover" 
              translation="translatePhrase"
              tooltip-text="Duplicate entity"></tooltip-component>
          </i>
        </div>

        <field-adder ref="fieldAdder" class="ItemLocal-action"
          v-if="!isLocked" 
          :entity-type="item['@type']" 
          :allowed="allowedProperties" 
          :inner="true" 
          :path="getPath">
        </field-adder>

        <div class="ItemLocal-action">
          <i class="fa fa-trash-o icon icon--sm" 
            v-if="!isLocked" 
            :class="{'show-icon': showActionButtons}" 
            v-on:click="removeThis(true)" 
            @keyup.enter="removeThis(true)"
            tabindex="0"
            @focus="removeHover = true, removeHighlight(true, $event)"
            @blur="removeHover = false, removeHighlight(false, $event)"
            @mouseover="removeHover = true, removeHighlight(true, $event)"
            @mouseout="removeHover = false, removeHighlight(false, $event)">
            <tooltip-component 
              :show-tooltip="removeHover" 
              tooltip-text="Remove" 
              translation="translatePhrase"></tooltip-component>
          </i>
        </div>
      </div>
    </strong>
  
    <ul class="ItemLocal-list js-itemLocalFields">      
      <!-- <field-adder 
        v-if="!isLocked && isEmpty" 
        :entity-type="item['@type']" 
        :allowed="allowedProperties" 
        :inner="true" 
        :path="getPath"></field-adder> -->
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
        :show-action-buttons="showActionButtons"
        :is-expanded="expanded"></field> 
    </ul>

    <search-window 
      :isActive="extractDialogActive" 
      :can-copy-title="canCopyTitle" 
      :copy-title="copyTitle" 
      :entity-type="entityType" 
      :field-key="fieldKey" 
      :extracting="extracting" 
      :item-info="extractedMainEntity"
      :index="index"
      @extract="extract"
      @replace-with="replaceWith"></search-window>
    </div>
</template>

<style lang="less">
.ItemLocal {
  padding: 5px 0;
  margin-left: -5px;
  border-radius: 4px;
  position: relative;
  flex: 1 100%;
  transition: background-color .5s ease;
  width: 100%;

  &.has-failed-validations {
    outline: 1px dotted red;
  }

  &-heading {
    display: block;
    flex: 1 100%;
    font-weight: normal;
    position: relative;
  }

  &-label {
    margin-right: 120px;
    
    &.is-inactive {
      pointer-events: none;
    }
  }

  &-type {
    cursor: pointer;
  }

  &-arrow {
    font-size: 14px;
    transition: all 0.2s ease;
    padding: 0 2px;
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
    top: 0;
    right: 0;
    position: absolute;

    @media (max-width: @screen-sm) {
      display: flex;
      align-items: baseline;
    }
  }

  &-action {
    min-width: 20px;
    display: inline-block;
    margin-right: 5px;
  }

  &.is-marked {
    background-color: @sec;
  }
  
  &.is-removeable {
    background-color: @danger;
  }

  &-collapsedLabel {
    cursor: pointer;
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
    background-color: @sec;
  }
}
</style>
