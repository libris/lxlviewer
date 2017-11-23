<script>
import { mixin as clickaway } from 'vue-clickaway';
import * as _ from 'lodash';
import ToolTipComponent from './tooltip-component';
import * as LayoutUtil from '../utils/layout';
import * as StringUtil from '../utils/string';
import { getSettings, getVocabulary, getContext } from '../vuex/getters';
import { changeStatus, changeNotification } from '../vuex/actions';
import ComboKeys from 'combokeys';


export default {
  mixins: [clickaway],
  name: 'field-adder',
  props: {
    allowed: [],
    active: false,
    filterKey: '',
    inner: false,
    path: '',
    index: Number,
    editingObject: '',
  },
  vuex: {
    getters: {
      settings: getSettings,
      vocab: getVocabulary,
      context: getContext,
    },
    actions: {
      changeStatus,
      changeNotification,
    },
  },
  data() {
    return {
      buttonFixed: true,
      buttonPos: -1,
      selectedIndex: -1,
      fieldListBottom: false,
      showToolTip: false,
    };
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.moveFieldAdderButton);
    // const fieldsWindow = document.getElementById('fields-window');
    // fieldsWindow.removeEventListener('scroll', this.toggleWindowFade);
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => { // TODO: Fix proper scroll tracking. This is just an ugly solution using document.onscroll here and window.scroll in editorcontrols.vue
      if (!this.inner) {
        window.addEventListener('scroll', this.moveFieldAdderButton);
        this.moveFieldAdderButton();
      }
    });
  },
  computed: {
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
      this.show();
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
      const threshold = targetElement.scrollHeight;
      const position = targetElement.offsetHeight + targetElement.scrollTop;
      if (threshold > position) {
        this.fieldListBottom = false;
      } else {
        this.fieldListBottom = true;
      }
    },
    moveFieldAdderButton() {
      const fieldAdderIndex = this.editingObject === 'mainEntity' ? 0 : 1;
      const topFormComponent = document.getElementsByClassName('focused-form-component')[fieldAdderIndex];
      const buttonHeight = document.getElementsByClassName('add-button')[fieldAdderIndex].offsetHeight;
      const buttonThreshold = topFormComponent.offsetTop + topFormComponent.offsetHeight - buttonHeight;
      const buttonPos = window.pageYOffset + window.innerHeight - 80;
      if ((buttonThreshold > buttonPos) && buttonPos > topFormComponent.offsetTop) {
        this.buttonFixed = true;
      } else {
        this.buttonFixed = false;
      }
    },
    addField(prop, close) {
      if (!prop.added) {
        const splitProp = prop.item['@id'].split('/');
        const propLastPart = splitProp[splitProp.length-1];
        const fieldName = prop.item['@id'].split(':')[1];
        this.$dispatch('add-field', prop.item, this.path);
        const translatedProp = StringUtil.getLabelByLang(propLastPart, this.settings.language, this.vocab, this.settings.vocabPfx, this.context);
        if (close) {
          this.hide();
          this.changeStatus('lastAdded', propLastPart);
        }
        this.$dispatch('expand-item');
      }
    },
    show() {
      LayoutUtil.scrollLock(true);
      this.active = true;
      setTimeout(() => {
        const input = document.getElementById('field-adder-input');
        input.focus();
        const fieldsWindow = document.getElementById('fields-window');
        fieldsWindow.addEventListener('scroll', this.toggleWindowFade);
      }, 1);
      this.changeStatus('keybindState', 'field-adder');
    },
    hide() {
      if (!this.active) return;
      this.active = false;
      LayoutUtil.scrollLock(false);
      this.filterKey = '';
      this.changeStatus('keybindState', 'overview');
      this.resetSelectIndex();
    },
    resetSelectIndex() {
      this.fieldListBottom = false;
      this.selectedIndex = -1;
    },
  },
  components: {
    'tooltip-component': ToolTipComponent,
  },
};
</script>

<template>
  <div :class="{'container': !inner}">
    <div class="field-adder">
      <div v-if="inner" class="field-adder-bar" v-on:click="show" @mouseenter="showToolTip = true" @mouseleave="showToolTip = false">
        <i class="fa fa-plus-square-o plus-icon" aria-hidden="true">
          <tooltip-component :show-tooltip="showToolTip" tooltip-text="Add field" translation="translatePhrase"></tooltip-component>
        </i>
        {{ "Field" | translatePhrase }}
      </div>
      <a v-if="!inner && !buttonFixed" class="add-button absolute" v-on:click="show" @mouseenter="showToolTip = true" @mouseleave="showToolTip = false">
        <i class="fa fa-plus plus-icon" aria-hidden="true">
          <tooltip-component :show-tooltip="showToolTip" tooltip-text="Add field" translation="translatePhrase"></tooltip-component>
        </i>
      </a>
      <a v-if="!inner && buttonFixed" class="add-button fixed" v-on:click="show" @mouseenter="showToolTip = true" @mouseleave="showToolTip = false">
        <i class="fa fa-plus plus-icon" aria-hidden="true">
          <tooltip-component :show-tooltip="showToolTip" tooltip-text="Add field" translation="translatePhrase"></tooltip-component>
        </i>
      </a>
      <div class="window"  v-if="active" :class="{'at-bottom': fieldListBottom}">
        <div class="header">
          <span class="title">
            {{ "Add field" | translatePhrase }}
          </span>
          <span class="windowControl">
            <i v-on:click="hide" class="fa fa-close"></i>
          </span>
          <span class="filter">
            {{ "Filter by" | translatePhrase }} <input id="field-adder-input" class="filterInput mousetrap" @input="resetSelectIndex()" type="text" v-model="filterKey"></input>
            <span class="filterInfo">{{ "Showing" | translatePhrase }} {{ filteredResults.length }} {{ "of" | translatePhrase }} {{allowed ? allowed.length : '0'}} {{ "total" | translatePhrase }}</span>
          </span>
        </div>
        <div class="column-titles">
          <span class="fieldLabel">
            {{ "Field label" | translatePhrase }}
          </span>
          <span class="classInfo">
            {{ "Recieves" | translatePhrase }}
          </span>
        </div>
        <ul v-if="active" id="fields-window" class="field-list">
          <li v-on:mouseover="selectedIndex = $index" v-bind:class="{ 'added': prop.added, 'available': !prop.added, 'selected': $index == selectedIndex }" v-for="prop in filteredResults" track-by="$index" @click="addField(prop, true)">
            <span class="addControl">
              <a v-on:click.prevent="addField(prop, false)"><i class="fa fa-fw fa-2x fa-plus-circle"></i></a>
              <span><i class="fa fa-fw fa-check fa-2x"></i></span>
            </span>
            <span class="fieldLabel" title="{{prop.label | capitalize }}">
              {{prop.label | capitalize }}
              <span class="typeLabel">{{ prop.item['@id'] | removeDomain }}</span>
            </span>
            <span class="classInfo">
              {{ getPropClassInfo(prop.item) }}
            </span>
          </li>
          <li v-if="filteredResults.length === 0"><i>{{ "Did not find any fields" | translatePhrase }}...</i></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.field-adder {
  text-align: right;
  .field-adder-bar {
    cursor: pointer;
    text-align: center;
    padding: 0 0.5em;
  }
  display: block; // So that the clickaway plugin triggers nicely
  .add-button {
    margin-left: 100%;
    background-color: @brand-primary;
    transition: bottom 0.25s cubic-bezier(0.4, 0, 1, 1);
    color: @white;
    position: fixed;
    margin-left: 0.5em;
    border-radius:2em;
    box-shadow: 0px 7px 10px 0px rgba(0,0,0,0.7);
    cursor: pointer;
    font-size: 1.5em;
    padding: 1em 1.2em;
    line-height: 1.2em;
    text-decoration: none;
    &.fixed {
      position: fixed;
      bottom: 12px;
    }
    &.absolute {
      position: absolute;
      transform: translateY(-67px);
    }
    .plus-icon {
      -webkit-text-stroke: 0.12em @brand-primary;
    }
    &:hover {
      background-color: lighten(@brand-primary, 5%);
      .plus-icon {
        -webkit-text-stroke: 0.12em lighten(@brand-primary, 5%);
      }
    }
    &:active {
      box-shadow: 0px 5px 10px 0px rgba(0,0,0,0.5);
    }
  }
  >a {
    cursor: pointer;
  }
  .list-scroller {
    color: @gray-darker;
    font-size: 39px;
    width: 0;
    position: fixed;
    left: 0;
    right: 0;
    cursor: pointer;
    bottom: 5%;
    margin: 0 auto;
    z-index: 1000;
    opacity: 1;
    transition: all 0.2s ease;
    &:hover {
      color: @black;
      font-size: 40px;
    }
    &.at-bottom {
      opacity: 0;
      bottom: 2%;
      transition: all 0.2s ease;
    }
  }
  .at-bottom {
    &:after {
      opacity: 0;
      transition: all 0.5s ease;
    }
  }

  .window {
    &:after {
      transition: all 0.5s ease;
      position: absolute;
      bottom: 0;
      height: 100%;
      width: 100%;
      content: "";
      opacity: 0;
      background: linear-gradient(to top,
        rgba(255,255,255, 1) 0%,
        rgba(255,255,255, 0) 12%
      );
      pointer-events: none; /* so the text is still selectable */

    }
    &:not(.at-bottom) {
      &:after {
        opacity: 1;
        transition: all 0.5s ease;
      }
    }
    .window-mixin();
    .header {
      .filter {
        font-size: 85%;
        float: right;
        .filterInput {
          border-radius: 3px;
          border: 0px;
          padding: 3px 5px;
          margin: 0px 10px 0px 10px;
          color: @black;
          display: inline-block;
        }
        .filterInfo {
          display: inline-block;
          width: 170px;
          text-align: right;
          padding: 3px 10px 3px 3px;
        }
      }
    }
    .column-titles {
      background-color: @white;
      border: solid @gray;
      border-width: 0px 0px 1px 0px;
      > * {
        display: inline-block;
      }
      .fieldLabel {
        margin-left: 8%;
        width: 45%;
      }
      .classInfo {
        width: 40%;
      }
    }
    ul {
      border-radius: 0px 0px 3px 3px;
      width: 100%;
      height: 95%;
      overflow-y: auto;
      margin: 0px;
      list-style-type: none;
      padding: 0;
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
        .fieldLabel {
          display: inline-block;
          width: 45%;
          font-size: 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          .typeLabel {
            display: block;
            font-size: 85%;
            font-family: monospace;
          }
        }
        .classInfo {
          display: inline-block;
          width: 40%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 85%;
        }
        .addControl {
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
