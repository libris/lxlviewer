<script>
/*
  This component is used for the special case for when we want to show a sibling (ie a work in an instance)
  as an item-local in mainEntity. Most of the functionality is similar to those in item-local, but with some
  important differences. Examples of this is the path-variables as they are pointing to one place for what data to show,
  and to another for what data to edit.
*/

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
  name: 'item-sibling',
  mixins: [FormMixin, ItemMixin, LensMixin, clickaway],
  props: {
    id: '',
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
    item() {
      return _.cloneDeep(this.inspector.data[this.suffix]);
    },
    suffix() {
      return this.id.split('#')[1];
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
      return this.suffix;
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
    formObj() {
      return this.item;
    },
  },
  methods: {
    removeThis() {
      const changeList = [
        {
          path: `${this.parentPath}`,
          value: null,
        }
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
    actionHighlight(active) {
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
    removeHighlight(active) {
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
            this.$store.dispatch('pushNotification', { type: 'danger', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error}` });
            this.closeExtractDialog();
          });
        } else {
          this.$store.dispatch('pushNotification', { type: 'danger', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error}` });
          this.closeExtractDialog();
        }
      }, (error) => {
        this.$store.dispatch('pushNotification', { type: 'danger', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error}` });
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
        }
      ];
      this.$store.dispatch('updateInspectorData', {
        addToHistory: true,
        changeList: changeList,
      });
      this.$store.dispatch('pushNotification', { type: 'success', message: `${StringUtil.getUiPhraseByLang('Linking was successful', this.settings.language)}` });
      this.closeExtractDialog();
    },
  },
  watch: {
    isEmpty(val) {
      if (val) {
        this.$el.getElementsByClassName('js-expandable')[0].classList.add('is-inactive');
        this.$el.classList.remove('is-expanded');
      } else {
        this.$el.getElementsByClassName('js-expandable')[0].classList.remove('is-inactive');
        this.$el.classList.add('is-expanded');
      }
    },
    'inspector.event'(val, oldVal) {
      this.$emit(`${val.value}`);
    }
  },
  created: function () {
    this.$on('collapse-item', this.collapse);
    this.$on('expand-item', this.expand);
  },
  mounted() {
    if (this.isLastAdded) {
      this.toggleExpanded();
      setTimeout(()=> {
        if (this.isEmpty) {
          this.$el.getElementsByClassName('js-expandable')[0].classList.add('is-inactive');
        } else {
          this.expand();
        }
        this.$store.dispatch('setInspectorStatusValue', { property: 'lastAdded', value: '' });
      }, 1000)
    } 
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
  <div class="ItemSibling js-itemLocal"
    tabindex="0"
    :class="{'is-highlighted': isNewlyAdded, 'is-expanded': expanded, 'is-extractable': isExtractable}"
    @keyup.enter="checkFocus()" 
    @focus="addFocus()"
    @blur="removeFocus()">
   
   <strong class="ItemSibling-heading">
      <div class="ItemSibling-label js-expandable">
        <i class="ItemSibling-arrow fa fa-chevron-right " 
          :class="{'down': expanded}"
          @click="toggleExpanded()"></i>
        <span class="ItemSibling-type" 
          @click="toggleExpanded($event)" 
          :title="item['@type']">{{ item['@type'] | labelByLang | capitalize }}:</span>
        <span class="ItemSibling-collapsedLabel" @click="toggleExpanded()">
          <span class="ItemSibling-collapsedText" v-show="!expanded || isEmpty">{{getItemLabel}}</span>
          <span class="placeholder"> </span>
        </span>
      </div>
      
      <div class="ItemSibling-actions">
        <i class="ItemSibling-action fa fa-link icon icon--sm"
          v-if="inspector.status.editing && isExtractable"
          @click="openExtractDialog()" 
          tabindex="0"
          @keyup.enter="openExtractDialog()"
          @focus="showLinkAction = true, actionHighlight(true)" 
          @blur="showLinkAction = false, actionHighlight(false)"
          @mouseover="showLinkAction = true, actionHighlight(true)" 
          @mouseout="showLinkAction = false, actionHighlight(false)">
          <tooltip-component 
            :show-tooltip="showLinkAction" 
            tooltip-text="Link entity" 
            translation="translatePhrase"></tooltip-component>
        </i>
        <field-adder class="ItemSibling-action"
          v-if="!isLocked" 
          :entity-type="item['@type']" 
          :allowed="allowedProperties" 
          :inner="true" 
          :path="getPath">
        </field-adder>
        <i class="ItemSibling-action fa fa-trash-o icon icon--sm" 
          v-if="!isLocked" 
          :class="{'show-icon': showActionButtons}" 
          v-on:click="removeThis(true)"
          @keyup.enter="removeThis(true)"
          tabindex="0"
          @focus="removeHover = true, removeHighlight(true)" 
          @blur="removeHover = false, removeHighlight(false)"
          @mouseover="removeHover = true, removeHighlight(true)" 
          @mouseout="removeHover = false, removeHighlight(false)">
          <tooltip-component 
            :show-tooltip="removeHover" 
            tooltip-text="Remove" 
            translation="translatePhrase"></tooltip-component>
        </i>
      </div>
    </strong>
  
    <ul class="ItemSibling-list js-itemLocalFields">      
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
        :show-action-buttons="showActionButtons"></field>
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
    transition: all 0.2s ease;
    padding: 0 2px;
    margin: 0 0 0 1px;
    cursor: pointer;

    .is-inactive & {
      color: @gray-light;
      pointer-events: none;
      cursor: not-allowed;
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
    min-width: 20px;
    margin-right: 5px;
  }

  &-collapsedLabel {
    cursor: pointer;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;

    & .placeholder {
      visibility: hidden;
    }
  }

  &.is-marked {
    background-color: @sec;
  }
  
  &.is-removeable {
    background-color: @danger;
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
    background: @gray-darker;
    color: @white;
    &.active {
      background: lighten(@gray-darker, 15%);
      cursor: pointer;
    }
  }
  &.is-highlighted {
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
