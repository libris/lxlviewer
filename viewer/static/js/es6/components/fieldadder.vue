<script>
import { mixin as clickaway } from 'vue-clickaway';
import * as _ from 'lodash';
import * as LayoutUtil from '../utils/layout';
import { getSettings } from '../vuex/getters';
import { changeStatus, changeNotification } from '../vuex/actions';
import ComboKeys from 'combokeys';

function moveFieldAdderButton(e) {
  const topFormComponent = document.getElementsByClassName('focused-form-component')[0];
  const buttonThreshold = topFormComponent.offsetTop + topFormComponent.offsetHeight + document.getElementById('add-button').offsetHeight;
  if (this.buttonPos === -1) {
    this.buttonPos = document.getElementById('add-button').offsetTop;
  }
  const scrollPosition = this.buttonPos + e.target.body.scrollTop;
  if (buttonThreshold > scrollPosition) {
    this.buttonFixed = true;
  } else {
    this.buttonFixed = false;
  }
}

export default {
  mixins: [clickaway],
  name: 'field-adder',
  props: {
    allowed: [],
    active: false,
    filterKey: '',
    focus: '',
  },
  vuex: {
    getters: {
      settings: getSettings,
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
    };
  },
  beforeDestroy() {
    window.removeEventListener('scroll', moveFieldAdderButton);
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => { // TODO: Fix proper scroll tracking. This is just an ugly solution using document.onscroll here and window.scroll in editorcontrols.vue
      window.addEventListener('scroll', moveFieldAdderButton);
    });
  },
  computed: {
    isWork() {
      return this.focus === 'work';
    },
    isInstance() {
      return this.focus === 'mainEntity';
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
    state() {
      const focus = this.focus;
      if (focus === 'mainEntity') {
        return 'instans';
      } else if (focus === 'work') {
        return 'verks';
      }
      return 'Unknown';
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
        this.addField(this.filteredResults[this.selectedIndex].item, false);
      } else {
        console.warn("already added, should be handled");
      }
    },
    'add-field-single'() {
      if (!this.filteredResults[this.selectedIndex].added) {
        this.addField(this.filteredResults[this.selectedIndex].item, true);
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
    addField(prop, close) {
      const fieldName = prop['@id'].split(':')[1];
      this.$dispatch('add-field', prop);
      this.changeNotification('color', 'green');
      this.changeNotification('message', `${fieldName} lades till.`);
      if (close) {
        this.hide();
        this.changeStatus('lastAdded', fieldName);
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
  <div class="field-adder container">
    <a id="add-button" v-on:click="show" :class="{ 'work-state': isWork, 'instance-state': isInstance, 'is-fixed': buttonFixed }">
      <i class="fa fa-fw fa-plus plus-icon" aria-hidden="true"></i>
    </a>
    <a id="mock-button" v-show="buttonFixed">
      <i class="fa fa-plus plus-icon" aria-hidden="true"></i>
      NYTT FÄLT
    </a>
    <div class="window" v-show="active">
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
      <ul v-if="active" class="field-list">
        <li v-on:mouseover="selectedIndex = $index" v-bind:class="{ 'added': prop.added, 'available': !prop.added, 'selected': $index == selectedIndex }" v-for="prop in filteredResults" track-by="$index" @click="addField(prop.item, true)">
          <span class="fieldLabel" title="{{prop.item['@id'] | labelByLang | capitalize }}">
            {{prop.item['@id'] | labelByLang | capitalize }}
          </span>
          <span class="typeLabel">{{ prop.item['@id'] }}</span>
          <span class="addControl">
            <a v-on:click.prevent="addField(prop.item, false)"><i class="fa fa-plus-circle"></i></a>
            <span><i class="fa fa-check"></i></span>
          </span>
        </li>
        <li v-if="filteredResults.length === 0"><i>{{ "Did not find any fields" | translatePhrase }}...</i></li>
      </ul>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.field-adder {
  background-color: #fff;
  text-align: right;
  height: 0;
  margin: 35px;
  display: block; // So that the clickaway plugin triggers nicely
  #add-button {
    background-color: @brand-primary;
    color: @white;
    &.is-fixed {
      position: fixed;
      bottom: 3%;
      top: auto;
    }
    border-radius:2em;
    box-shadow: 0px 7px 10px 0px rgba(0,0,0,0.7);
    cursor:pointer;
    font-size: 1.5em;
    padding: 1em 1em;
    line-height: 1.2em;
    text-decoration: none;
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
      bottom: 2.7%;
      box-shadow: 0px 5px 10px 0px rgba(0,0,0,0.5);
    }
  }
  #mock-button {
    visibility: hidden;
  }
  >a {
    cursor: pointer;
  }
  .window {
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
      height: 100%;
      overflow-y: auto;
      margin: 0px;
      list-style-type: none;
      padding: 0px;
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
          float: right;
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
