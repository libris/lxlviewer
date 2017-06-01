<script>
import { mixin as clickaway } from 'vue-clickaway';
import * as _ from 'lodash';
import * as LayoutUtil from '../utils/layout';
import * as StringUtil from '../utils/string';
import { getSettings, getVocabulary } from '../vuex/getters';
import { changeStatus, changeNotification } from '../vuex/actions';
import ComboKeys from 'combokeys';


export default {
  mixins: [clickaway],
  name: 'field-adder',
  props: {
    allowed: [],
    active: false,
    filterKey: '',
  },
  vuex: {
    getters: {
      settings: getSettings,
      vocab: getVocabulary,
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
    };
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.moveFieldAdderButton);
    const fieldsWindow = document.getElementById('fields-window');
    fieldsWindow.removeEventListener('scroll', this.toggleWindowFade);
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => { // TODO: Fix proper scroll tracking. This is just an ugly solution using document.onscroll here and window.scroll in editorcontrols.vue
      window.addEventListener('scroll', this.moveFieldAdderButton);
      this.moveFieldAdderButton();
      const fieldsWindow = document.getElementById('fields-window');
      fieldsWindow.addEventListener('scroll', this.toggleWindowFade);
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
    },
    'select-prev'() {
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
    },
    'add-field-multiple'() {
      if (!this.filteredResults[this.selectedIndex].added) {
        this.addField(this.filteredResults[this.selectedIndex], false);
      } else {
        console.warn("already added, should be handled");
      }
    },
    'add-field-single'() {
      if (!this.filteredResults[this.selectedIndex].added) {
        this.addField(this.filteredResults[this.selectedIndex], true);
      } else {
        console.warn("already added, should be handled");
      }
    },
    'close-modals'() {
      this.hide();
      this.selectedIndex = -1;
    },
  },
  methods: {
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
    scrollToBottom() {
      const scrollElement = document.getElementById('fields-window');
      const scrollPos = scrollElement.scrollHeight - scrollElement.offsetHeight;
      scrollElement.scrollTop = scrollPos;
    },
    moveFieldAdderButton(e) {
      const topFormComponent = document.getElementsByClassName('focused-form-component')[0];
      const buttonThreshold = topFormComponent.offsetTop + topFormComponent.offsetHeight;
      const buttonPos = window.pageYOffset + window.innerHeight - 80;
      if (buttonThreshold > buttonPos) {
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
        this.$dispatch('add-field', prop.item);
        const translatedProp = StringUtil.labelByLang(propLastPart, this.settings.language, this.vocab, this.settings.vocabPfx);
        // this.changeNotification('color', 'green');
        // this.changeNotification('message', `Fältet "${translatedProp}" lades till.`);
        if (close) {
          this.hide();
          this.changeStatus('lastAdded', propLastPart);
        }
      }
    },
    show() {
      LayoutUtil.scrollLock(true);
      this.active = true;
      setTimeout(() => { // TODO: Solve this by setting focus after window has been rendered.
        document.getElementById('test').focus();
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
      this.selectedIndex = -1;
    },
  },
  components: {
  },
};
</script>

<template>
  <div class="container">
    <div class="field-adder">
      <div class="field-adder-bar" v-on:click="show">
        <i class="fa fa-plus plus-icon" aria-hidden="true"></i>
        {{ "Add field" | translatePhrase }}
      </div>
      <a id="add-button" v-on:click="show" :class="{'at-bottom': !buttonFixed }">
        <i class="fa fa-plus plus-icon" aria-hidden="true"></i>
        <div>{{ "Add field" | translatePhrase }}</div>
      </a>
      <div class="window"  v-show="active" :class="{'at-bottom': fieldListBottom}">
        <div class="header">
          <span class="title">
            {{ "Add field" | translatePhrase }}
          </span>
          <span class="windowControl">
            <i v-on:click="hide" class="fa fa-close"></i>
          </span>
          <span class="filter">
            {{ "Filter by" | translatePhrase }} <input id="test" class="filterInput mousetrap" @input="resetSelectIndex()" type="text" v-model="filterKey"></input>
            <span class="filterInfo">{{ "Showing" | translatePhrase }} {{ filteredResults.length }} {{ "of" | translatePhrase }} {{allowed ? allowed.length : '0'}} {{ "total" | translatePhrase }}</span>
          </span>
        </div>
        <ul v-show="active" id="fields-window" class="field-list">
          <li v-on:mouseover="selectedIndex = $index" v-bind:class="{ 'added': prop.added, 'available': !prop.added, 'selected': $index == selectedIndex }" v-for="prop in filteredResults" track-by="$index" @click="addField(prop, true)">
            <span class="addControl">
              <a v-on:click.prevent="addField(prop, false)"><i class="fa fa-fw fa-plus-circle"></i></a>
              <span><i class="fa fa-fw fa-check"></i></span>
            </span>
            <span class="fieldLabel" title="{{prop.label | capitalize }}">
              {{prop.label | capitalize }}
            </span>
            <span class="typeLabel">{{ prop.item['@id'] | removeDomain }}</span>
          </li>
          <li v-if="filteredResults.length === 0"><i>{{ "Did not find any fields" | translatePhrase }}...</i></li>
        </ul>
      </div>
      <i v-show="active" :class="{'at-bottom': fieldListBottom}" class="fa fa-chevron-down list-scroller" aria-hidden="true" @click="scrollToBottom"></i>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.field-adder {
  background-color: #fff;
  text-align: right;
  .field-adder-bar {
    cursor: pointer;
    border: 1px dashed @gray-light;
    padding: 0.8em;
    text-align: center;
    &:hover {
      border-color: @gray-darker;
    }
  }
  display: block; // So that the clickaway plugin triggers nicely
  #add-button {
    margin-left: 100%;
    background-color: @brand-primary;
    transition: bottom 0.25s cubic-bezier(0.4, 0, 1, 1);
    color: @white;
    position: fixed;
    margin-left: -1.75em;
    bottom: 12px;
    border-radius:2em;
    box-shadow: 0px 7px 10px 0px rgba(0,0,0,0.7);
    cursor:pointer;
    font-size: 1.5em;
    padding: 1em 1.2em;
    line-height: 1.2em;
    text-decoration: none;
    &.at-bottom {
      bottom: -100px;
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
      bottom: 8px;
      box-shadow: 0px 5px 10px 0px rgba(0,0,0,0.5);
    }
    > div {
      font-size: 22px;
      opacity: 0;
      max-height: 0;
      max-width: 0;
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
    ul {
      border: solid @gray;
      border-width: 1px 0px 0px 0px;
      border-radius: 0px 0px 3px 3px;
      width: 100%;
      height: 95%;
      overflow-y: auto;
      margin: 0px;
      list-style-type: none;
      padding: 0px 0px 3em 0px;
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
        padding: 3px;
        line-height: 1.3;
        .fieldLabel {
          display: inline-block;
          width: 45%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .typeLabel {
          display: inline-block;
          width: 40%;
          margin-left: 1em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 85%;
          font-family: monospace;
        }
        .addControl {
          float: left;
          margin-left: 1em;
          margin-right: 1em;
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
