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
import ModalComponent from '@/components/shared/modal-component.vue';
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
      const title = StringUtil.getUiPhraseByLang('Add field', this.settings.language);
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
  events: {
    'open-add-field-window'() {
      if (!this.inner) {
        this.show();
      }
    },
    'select-next'() {
      if (this.active) {
        if (this.selectedIndex < this.filteredResults.length - 1) {
          if (this.selectedIndex >= 0) {
            const fieldList = document.getElementsByClassName('field-list')[0];
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
    'select-prev'() {
      if (this.active) {
        if (this.selectedIndex > 0) {
          this.selectedIndex -= 1;
          const fieldList = document.getElementsByClassName('field-list')[0];
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
    'add-field-multiple'() {
      if (this.active) {
        if (!this.filteredResults[this.selectedIndex].added) {
          this.addField(this.filteredResults[this.selectedIndex], false);
        } else {
          console.warn("already added, should be handled");
        }
      }
    },
    'add-field-single'() {
      if (this.active) {
        if (!this.filteredResults[this.selectedIndex].added) {
          this.addField(this.filteredResults[this.selectedIndex], true);
        } else {
          console.warn("already added, should be handled");
        }
      }
    },
    'close-modals'() {
      this.hide();
      return true;
    },
  },
  methods: {
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
      if (prop['@type'] === 'DatatypeProperty' || contextValue === '@vocab') {
        if (VocabUtil.propIsRepeatable(key, this.resources.context)) {
          value = [''];
        } else {
          value = '';
        }
      } else {
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
          path: `${this.path}.${key}`,
          value: this.getEmptyFieldValue(key, prop.item),
          addToHistory: true,
        });
        this.$store.dispatch('setInspectorStatusValue', { property: 'unsavedChanges', value: true });
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
  mounted() {
    this.$nextTick(() => { // TODO: Fix proper scroll tracking. This is just an ugly solution using document.onscroll here and window.scroll in editorcontrols.vue
    });
  },
  components: {
    'modal-component': ModalComponent,
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
      @mouseenter="showToolTip = true" 
      @mouseleave="showToolTip = false">
      <i class="FieldAdder-innerIcon fa fa-plus plus-icon" aria-hidden="true">
        <tooltip-component 
          :show-tooltip="showToolTip" 
          tooltip-text="Add field" 
          translation="translatePhrase"></tooltip-component>
      </i>
      <span class="FieldAdder-innerLabel">{{ "Field" | translatePhrase }}</span>
    </span>

    <button v-if="!inner" class="FieldAdder-add btn btn-default toolbar-button" 
      v-on:click="show" 
      @keyup.enter="show"
      @mouseenter="showToolTip = true" 
      @mouseleave="showToolTip = false">
      <i class="FieldAdder-icon fa fa-plus plus-icon" aria-hidden="true">
        <tooltip-component tooltip-text="Add field"
          :show-tooltip="showToolTip" 
          translation="translatePhrase"></tooltip-component>
      </i>
      <span v-if="!inToolbar" class="FieldAdder-label"> {{ "Field" | translatePhrase }}</span>
    </button>

    <modal-component @close="hide" v-if="active" class="FieldAdder-modal FieldAdderModal">
      <template slot="modal-header">
        <header>
          {{ modalTitle }}
        </header>
        <span class="FieldAdderModal-filter">
          {{ "Filter by" | translatePhrase }} 
          <input id="field-adder-input" 
            class="filterInput mousetrap" 
            @input="resetSelectIndex()" 
            type="text" 
            v-model="filterKey">
          <span class="filterInfo">{{ "Showing" | translatePhrase }} {{ filteredResults.length }} {{ "of" | translatePhrase }} {{allowed ? allowed.length : '0'}} {{ "total" | translatePhrase }}</span>
        </span>
        <span class="ModalComponent-windowControl">
          <i @click="hide" @keyup.enter="hide" tabindex="0" class="fa fa-close"></i>
        </span>
      </template>
      <template slot="modal-body">
        <div class="FieldAdderModal-columnHeaders">
          <span class="FieldAdderModal-addControl">
            &nbsp;
          </span>
          <span class="FieldAdderModal-fieldLabel">
            {{ "Field label" | translatePhrase }}
          </span>
          <span class="FieldAdderModal-classInfo">
            {{ "Can contain" | translatePhrase }}
          </span>
        </div>
        <div class="FieldAdderModal-fieldList">
          <ul id="fields-window">
            <li tabindex="0"
              @focus="selectedIndex = index"
              @mouseover="selectedIndex = index" 
              v-bind:class="{ 'added': prop.added, 'available': !prop.added, 'selected': index == selectedIndex }" 
              v-for="(prop, index) in filteredResults" 
              :key="prop['@id']" 
              @click="addField(prop, true)">
              <span class="FieldAdderModal-addControl">
                <a v-on:click.prevent="addField(prop, false)">
                  <i class="fa fa-fw fa-2x fa-plus-circle"></i>
                </a>
                <span><i class="fa fa-fw fa-check fa-2x"></i></span>
              </span>
              <span class="FieldAdderModal-fieldLabel" :title="prop.label | capitalize">
                {{prop.label | capitalize }}
                <span class="typeLabel">{{ prop.item['@id'] | removeDomain }}</span>
              </span>
              <span class="FieldAdderModal-classInfo">
                {{ getPropClassInfo(prop.item) }}
              </span>
            </li>
            <li v-if="filteredResults.length === 0">
              <i>{{ "Did not find any fields" | translatePhrase }}...</i>
            </li>
          </ul>
        </div>
      </template>
    </modal-component>
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
  }

  &-innerLabel {
    display: none;
  }
}

.FieldAdderModal {
  &-filter {
    input {
      height: 100%;
      color: #333;
      border-radius: 3px;
      border: none;
    }
  }

  &-body {
    display: flex;
    flex-direction: column;
  }

  &-columnHeaders {
    background-color: @white;
    position: fixed;
    z-index: 1;
    width: 100%;
    border: solid @gray;
    border-width: 0px 0px 1px 0px;
    > * {
      display: inline-block;
    }
  }
  &-fieldLabel {
    display: inline-block;
    width: 45%;
    font-size: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 5px 0 0;
    .typeLabel {
      display: block;
      font-size: 85%;
      font-family: monospace;
    }
  }
  &-classInfo {
    display: inline-block;
    width: 40%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 85%;
  }
  &-addControl {
    float: left;
    width: 8%;
    text-align: center;
    a {
      cursor: pointer;
    }
    span {
      display: none;
    }
  }
  &-fieldList {
    padding-top: 2em;
    padding-bottom: 3em;
    ul {
      border-radius: 0px 0px 3px 3px;
      padding-left: 0px;
      width: 100%;
      margin: 0px;
      list-style-type: none;
      li {
        &:nth-child(odd) {
          background-color: darken(@neutral-color, 5%);
        }
        &.available {
          cursor: pointer;
          &.selected {
            outline: solid 1px @brand-primary;
            background-color: fadeout(@brand-primary, 70%);
          }
        }
        &.added {
          &.selected {
            background-color: @gray-light;
          }
        }
        margin: 0px;
        padding: 1em 0;
        line-height: 1.3;
        display: flex;
        align-items: center;
        &.added {
          span {
            opacity: 0.6;
          }
          .addControl {
            a {
              display: none;
            }
            span {
              display: block;
            }
          }
        }
      }
    }
  }
}
</style>
