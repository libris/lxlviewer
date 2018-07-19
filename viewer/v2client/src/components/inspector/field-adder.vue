<script>
/*
  Controls add new field button and add field modal with it's content
*/

import { mixin as clickaway } from 'vue-clickaway';
import * as _ from 'lodash';
import ToolTipComponent from '../shared/tooltip-component';
import * as LayoutUtil from '@/utils/layout';
import * as StringUtil from '@/utils/string';
import * as VocabUtil from '@/utils/vocab';
import ComboKeys from 'combokeys';
import PanelComponent from '@/components/shared/panel-component.vue';
import { mapGetters } from 'vuex';

export default {
  mixins: [clickaway],
  name: 'field-adder',
  props: {
    allowed: {
      type: Array,
      default: () => [],
    },
    inner: false,
    path: '',
    index: Number,
    editingObject: '',
    entityType: '',
    inToolbar: false,
    forceActive: false
  },
  data() {
    return {
      active: false,
      buttonFixed: true,
      buttonPos: -1,
      filterKey: '',
      selectedIndex: -1,
      fieldListBottom: false,
      showToolTip: false,
    };
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    modalTitle() {
      const title = StringUtil.getUiPhraseByLang('Add field in', this.settings.language);
      const contextString = StringUtil.getLabelByLang(
        this.entityType, 
        this.settings.language, 
        this.resources.vocab, 
        this.resources.context
      );
      return `${title}: ${contextString}`;
    },
    filteredResults() {
      const lang = this.settings.language;
      if (!this.allowed || this.allowed.length === 0) {
        return [];
      }
      if (!this.filterKey || this.filterKey.length < 1) {
        if (this.allowed) {
          return this.allowed;
        }
      }
      const fKey = this.filterKey.toLowerCase();
      const filtered = _.filter(this.allowed, (o) => {
        let labelByLang = '';
        if (
          typeof o.item.labelByLang !== 'undefined' &&
          typeof o.item.labelByLang[lang] !== 'undefined'
        ) {
          if (_.isArray(o.item.labelByLang[lang])) {
            labelByLang = o.item.labelByLang[lang][0];
          } else {
            labelByLang = o.item.labelByLang[lang];
          }
        } else if (
          typeof o.item.prefLabelByLang !== 'undefined' &&
          typeof o.item.prefLabelByLang[lang] !== 'undefined'
        ) {
          if (_.isArray(o.item.prefLabelByLang[lang])) {
            labelByLang = o.item.prefLabelByLang[lang][0];
          } else {
            labelByLang = o.item.prefLabelByLang[lang];
          }
        }
        // @id
        const pId = o.item['@id'].toString().toLowerCase();
        // note
        const pNote = o.item.hasOwnProperty('note') ? o.item.note.toString().toLowerCase() : '';
        // label by lang
        const pLabel = labelByLang.toLowerCase() || '';
        return (
          pId.indexOf(fKey) !== -1 || pNote.indexOf(fKey) !== -1 || pLabel.indexOf(fKey) !== -1
        );
      });
      return filtered;
    },
  },
  methods: {
    toggleFullView() {
      const user = this.user;
      user.settings.forceFullViewPanel = !user.settings.forceFullViewPanel;
      this.$store.dispatch('setUser', user);
    },
    actionHighlight(active, event) {
      if(active) {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-itemLocal'));
          item.classList.add('is-marked');
      } else {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-itemLocal'));
          item.classList.remove('is-marked');
      }
    },
    selectNext() {
      if (this.active) {
        if (this.selectedIndex < this.filteredResults.length - 1) {
          if (this.selectedIndex >= 0) {
            const fieldList = document.getElementsByClassName('js-fieldlist')[0];
            const threshold =
              fieldList.getBoundingClientRect().top +
              fieldList.getBoundingClientRect().height;
            const selectedElement = document.getElementsByClassName('selected')[0];
            const selectedPosition =
              selectedElement.getBoundingClientRect().top +
              selectedElement.getBoundingClientRect().height * 2;
            if (selectedPosition > threshold) {
              fieldList.scrollTop += selectedElement.getBoundingClientRect().height * 2;
            }
          }
          this.selectedIndex += 1;
        }
      }
    },
    selectPrev() {
      if (this.active) {
        if (this.selectedIndex > 0) {
          this.selectedIndex -= 1;
          const fieldList = document.getElementsByClassName('js-fieldlist')[0];
          const threshold = fieldList.getBoundingClientRect().top;
          const selectedElement = document.getElementsByClassName('selected')[0];
          const selectedPosition =
            selectedElement.getBoundingClientRect().top -
            selectedElement.getBoundingClientRect().height;
          if (selectedPosition < threshold) {
            fieldList.scrollTop -= selectedElement.getBoundingClientRect().height * 2;
          }
        }
      }
    },
    addFieldMultiple() {
      if (this.active) {
        if (!this.filteredResults[this.selectedIndex].added) {
          this.addField(this.filteredResults[this.selectedIndex], false);
        } else {
          console.warn("Already added, should be handled");
        }
      }
    },
    addFieldSingle() {
      if (this.active) {
        if (!this.filteredResults[this.selectedIndex].added) {
          this.addField(this.filteredResults[this.selectedIndex], true);
        } else {
          console.warn("Already added, should be handled");
        }
      }
    },
    closeModals() {
      this.hide();
      return true;
    },
    getPropClassInfo(termObj) {
      if (_.isArray(termObj['@type'])) {
        if (termObj['@type'].indexOf('DatatypeProperty') > -1 && termObj['@type'].indexOf('DatatypeProperty') > -1) {
          return StringUtil.getUiPhraseByLang('Literals and entities', this.settings.language);
        } else if (termObj['@type'].indexOf('DatatypeProperty') > -1) {
          return StringUtil.getUiPhraseByLang('Literals', this.settings.language);
        } else if (termObj['@type'].indexOf('ObjectProperty') > -1) {
          return StringUtil.getUiPhraseByLang('Entities', this.settings.language);
        } else {
          return '';
        }
      } else {
        if (termObj['@type'] === 'DatatypeProperty') {
          return StringUtil.getUiPhraseByLang('Literals', this.settings.language);
        } else if (termObj['@type'] === 'ObjectProperty') {
          return StringUtil.getUiPhraseByLang('Entities', this.settings.language);
        }
      }
    },
    toggleWindowFade(e) {
      const targetElement = e.target;
      const threshold = targetElement.scrollHeight - 20;
      const position = targetElement.offsetHeight + targetElement.scrollTop;
      if (threshold > position) {
        this.fieldListBottom = false;
      } else {
        this.fieldListBottom = true;
      }
    },
    getEmptyFieldValue(key, prop) {
      let value = [];
      const contextValue = VocabUtil.getContextValue(key, '@type', this.resources.context);
      if (
        prop['@type'] === 'DatatypeProperty' &&
        prop.hasOwnProperty('range') &&
        prop.range.some(e => e['@id'] === 'http://www.w3.org/2001/XMLSchema#boolean')
      ) {
        // Boolean
        value = true;
      } else if (prop['@type'] === 'DatatypeProperty' || contextValue === '@vocab') {
        // String value (first as array and as single item)
        if (VocabUtil.propIsRepeatable(key, this.resources.context)) {
          value = [''];
        } else {
          value = '';
        }
      } else {
        // Object value (first as array and as single item)
        if (VocabUtil.propIsRepeatable(key, this.resources.context)) {
          value = [];
        } else {
          value = null;
        }
      }
      return value;
    },
    addField(prop, close) {  
      if (!prop.added) {
        const splitProp = prop.item['@id'].split('/');
        const propLastPart = splitProp[splitProp.length-1];
        const key = StringUtil.convertToPrefix(prop.item['@id'], this.resources.context);
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: `${this.path}.${key}`,
              value: this.getEmptyFieldValue(key, prop.item),
            }
          ],
          addToHistory: true,
        });
        if (close) {
          this.hide();
          this.$store.dispatch('setInspectorStatusValue', { 
            property: 'lastAdded', 
            value: `${this.path}.${key}` 
          });
        }
      }
      this.$parent.$emit('expand-item', true);
    },
    show() {
      this.active = true;
      setTimeout(() => {
        const input = document.getElementById('field-adder-input');
        input.focus();
        const fieldsWindow = document.getElementById('fields-window');
        fieldsWindow.addEventListener('scroll', this.toggleWindowFade);
      }, 1);
      this.$store.dispatch('setStatusValue', { 
        property: 'keybindState', 
        value: 'field-adder' 
      });
    },
    hide() {
      if (!this.active) return;
      this.active = false;
      this.filterKey = '';
      this.$store.dispatch('setStatusValue', { property: 'keybindState', value: 'overview' });
      this.resetSelectIndex();
    },
    resetSelectIndex() {
      this.fieldListBottom = false;
      this.selectedIndex = -1;
    },
  },
  watch: {
    forceActive: function(newVal, oldVal) {
      if (newVal != oldVal) {
        this.show();
      }
    },
    'inspector.event'(val, oldVal) {
      if (val.name === 'form-control') {
        switch (val.value) { 
          case 'select-next':
            this.selectNext();
            break;
          case 'select-prev':
            this.selectPrev();
            break;
          case 'close-modals':
            this.hide();
            break;
          case 'add-field-single':
            this.addFieldSingle();
            break;
          case 'add-field-multiple':
            this.addFieldMultiple();
            break;
          default:
            return;
        }
      }
    }, 
  },
  mounted() {
    this.$nextTick(() => { // TODO: Fix proper scroll tracking. This is just an ugly solution using document.onscroll here and window.scroll in editorcontrols.vue
    });
  },
  components: {
    'panel-component': PanelComponent,
    'tooltip-component': ToolTipComponent,
  },
};
</script>

<template>
  <div class="FieldAdder">
    <span v-if="inner" class="FieldAdder-innerAdd"
      v-on:click="show" 
      tabindex="0"
      @keyup.enter="show"
      @mouseenter="showToolTip = true, actionHighlight(true, $event)" 
      @mouseleave="showToolTip = false, actionHighlight(false, $event)">
      <i class="FieldAdder-innerIcon fa fa-plus-circle icon icon--sm" aria-hidden="true">
        <tooltip-component 
          :show-tooltip="showToolTip" 
          :tooltip-text="modalTitle" 
          translation="translatePhrase"></tooltip-component>
      </i>
      <span class="FieldAdder-innerLabel">{{ "Add field" | translatePhrase }}</span>
    </span>

    <button v-if="!inner" class="FieldAdder-add btn btn-default toolbar-button" 
      v-on:click="show" 
      @keyup.enter="show"
      @mouseenter="showToolTip = true" 
      @mouseleave="showToolTip = false">
      <i class="FieldAdder-icon fa fa-plus plus-icon" aria-hidden="true">
        <tooltip-component 
          class="Toolbar-tooltipContainer"
          :tooltip-text="modalTitle"
          :position="inToolbar ? 'left' : 'top'"
          keybind-name="open-field-adder"
          :show-tooltip="showToolTip"></tooltip-component>
      </i>
      <span v-if="!inToolbar" class="FieldAdder-label"> {{ "Add field" | translatePhrase }}</span>
    </button>

    <panel-component :title="modalTitle" @close="hide" v-if="active" class="FieldAdder-panel FieldAdderPanel">
      <template slot="panel-header-extra">
        <div class="FieldAdderPanel-filterContainer form-group panel">
          <input id="field-adder-input"
            type="text" 
            class="FieldAdderPanel-filterInput customInput form-control mousetrap" 
            @input="resetSelectIndex()" 
            :placeholder="'Filter by' | translatePhrase"
            v-model="filterKey">
        </div>
        <div class="FieldAdderPanel-filterInfo capitalHeading--gray">
          <span>
            {{ "Showing" | translatePhrase }} 
            {{ filteredResults.length }} 
            {{ "of" | translatePhrase }} 
            {{allowed ? allowed.length : '0'}} 
            {{ "total" | translatePhrase }}
          </span>
        </div>
      </template>
      <template slot="panel-header-after">
        <div class="FieldAdderPanel-columnHeaders">
          <!-- <span class="FieldAdderPanel-addControl">
          </span> -->
          <span class="FieldAdderPanel-fieldLabel capitalHeading--gray">
            {{ "Field label" | translatePhrase }}
          </span>
          <span class="FieldAdderPanel-classInfo capitalHeading--gray">
            {{ "Can contain" | translatePhrase }}
          </span>
        </div>
      </template>
      <template slot="panel-body">
        <div>
          <ul id="fields-window" class="FieldAdderPanel-fieldList js-fieldlist">
            <li tabindex="0"
              class="FieldAdderPanel-fieldItem"
              @focus="selectedIndex = index"
              @mouseover="selectedIndex = index" 
              v-bind:class="{ 'added': prop.added, 'available': !prop.added, 'selected': index == selectedIndex }" 
              v-for="(prop, index) in filteredResults" 
              :key="prop['@id']" 
              @click="addField(prop, true)"
              @keyup.enter="addField(prop, true)">
              <span class="FieldAdderPanel-addControl">
                <a 
                  v-show="!prop.added" 
                  @click.stop.prevent="addField(prop, false)"
                  @keyup.enter.stop.prevent="addField(prop, false)"
                  :title="'Add' | translatePhrase"
                  tabindex="0"
                  >
                  <i class="fa fa-plus-circle icon icon--lg icon--primary"></i>
                </a>
                <span v-show="prop.added" :title="'Added' | translatePhrase">
                  <i class="fa fa-check-circle icon icon--lg is-disabled"></i>
                </span>
              </span>
              <span class="FieldAdderPanel-fieldLabel" :title="prop.label | capitalize">
                {{prop.label | capitalize }}
                <span class="typeLabel">{{ prop.item['@id'] | removeDomain }}</span>
              </span>
              <span class="FieldAdderPanel-classInfo">
                {{ getPropClassInfo(prop.item) }}
              </span>
            </li>
            <div v-if="filteredResults.length === 0" class="PanelComponent-searchStatus">
              <span>{{ "Did not find any fields" | translatePhrase }}...</span>
            </div>
          </ul>
        </div>
      </template>
    </panel-component>
  </div>
</template>

<style lang="less">

.FieldAdder {
  &-add {
    font-size: 14px;
    font-size: 1.4rem;

    .FieldAdder--inToolbar & {
      border-radius: 100%;
      font-size: 22px;
      font-size: 2.2rem;
      width: 50px;
      height: 50px;
      line-height: 1;
    }
  }

  &--inToolbar {
    display: inline-block;
    position: relative;
  }

  &-innerLabel {
    display: none;
  }
  
  &-innerIcon {
    .ItemSibling-action & {
      color: @icon-primary;
      &:hover {
        color: @icon-primary--hover;
      }
    }
  }
}

.FieldAdderPanel {
  &-filterContainer {
    flex: 1;
  }

  &-filterInput {
  }

  &-filterInfo {
    color: @gray;
    margin-bottom: 10px;
  }

  &-body {
    display: flex;
    flex-direction: column;
  }

  &-columnHeaders {
    display: flex;
    background-color: @white;
    width: 100%;
    padding: 5px 15px;
    border-bottom: 1px solid @gray-lighter;

    &.FieldAdderPanel-fieldLabel {
      padding-left: 0;
    }
  }

  &-fieldLabel {
  display: inline-block;
  flex-basis: 75%;
  padding: 0 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .typeLabel {
    display: block;
    font-size: 14px;
    font-size: 1.4rem;
    font-family: monospace;
  }
}

  &-classInfo {
    display: inline-block;
    flex-basis: 25%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 85%;
  }

  &-addControl {
    display: flex;
    align-items: center;
    width: 30px;
  }

  &-fieldList {
    width: 100%;
    padding: 0;
    margin: 0;
    list-style-type: none;
  }

  &-fieldItem {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 15px;
    margin: 0px;
    background-color: @list-item-bg-even;
    transition: background-color 0.2s ease;
      
    &:nth-child(odd) {
      background-color: @list-item-bg-odd;
    }

    &.available {
      cursor: pointer;

      &:hover {
        background-color: @list-item-bg-hover;
      }
    }

    &.added {
      opacity: 0.5;
    }
  }
}
</style>
