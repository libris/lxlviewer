<script>
import { mixin as clickaway } from 'vue-clickaway';
import * as _ from 'lodash';
import * as LayoutUtil from '../utils/layout';
import { getSettings } from '../vuex/getters';

export default {
  mixins: [clickaway],
  name: 'field-adder',
  props: {
    allowed: [],
    active: false,
    filterKey: '',
    item: {},
  },
  vuex: {
    getters: {
      settings: getSettings,
    }
  },
  computed: {
    filteredResults() {
      const lang = this.settings.lang;
      if (!this.allowed || this.allowed.length === 0) {
        return [];
      }
      if (!this.filterKey || this.filterKey.length < 1) {
        if (this.allowed) {
          return this.allowed;
        }
      }
      const fKey = this.filterKey.toLowerCase();
      const filtered = _.filter(this.allowed, function(o) {
          let labelByLang = '';
          if (typeof o.item.labelByLang !== 'undefined' && typeof o.item.labelByLang[lang] !== 'undefined') {
            if (_.isArray(o.item.labelByLang[lang])) {
              labelByLang = o.item.labelByLang[lang][0];
            } else {
              labelByLang = o.item.labelByLang[lang];
            }
          }
          const pId = o.item['@id'].toString().toLowerCase(); // @id
          const pNote = o.item.hasOwnProperty('note') ? o.item['note'].toString().toLowerCase() : ''; // note
          const pLabel = labelByLang.toLowerCase() || ''; // label by lang
        return (pId.indexOf(fKey) !== -1 || pNote.indexOf(fKey) !== -1 || pLabel.indexOf(fKey) !== -1);
      });
      return filtered;
    },
  },
  events: {
    'close-modals': function() {
      this.hide();
    },
  },
  methods: {
    addField(prop) {
      this.$dispatch('add-field', prop);
      this.$dispatch('show-message', {
        title: 'Test',
        msg: 'Added field',
        type: 'success',
      });
    },
    show() {
      LayoutUtil.scrollLock(true);
      const self = this;
      self.active = true;
    },
    hide() {
      if (!this.active) return;
      this.active = false;
      LayoutUtil.scrollLock(false);
      this.filterKey = '';
    },
  },
  components: {
  },
};
</script>

<template>
  <div class="field-adder">
    <a v-on:click="show"><i class="fa fa-plus-circle"></i> Lägg till fält</a>
    <div class="window" v-show="active">
      <div class="header">
        <span class="title">
          Lägg till fält
        </span>
        <span class="windowControl">
          <i v-on:click="hide" class="fa fa-close"></i>
        </span>
        <span class="filter">
          Filtrera <input class="filterInput" type="text" v-model="filterKey"></input>
          <span class="filterInfo">Visar {{ filteredResults.length }} av totalt {{allowed ? allowed.length : '0'}}</span>
        </span>
      </div>
      <ul v-if="active">
        <li v-bind:class="{ 'added': prop.added }" v-for="prop in filteredResults">
          <span class="fieldLabel" title="{{prop.item['@id'] | labelByLang | capitalize }}">
            {{prop.item['@id'] | labelByLang | capitalize }}
          </span>
          <span class="typeLabel">{{ prop.item['@id'] }}</span>
          <span class="addControl">
            <a v-on:click.prevent="addField(prop.item)"><i class="fa fa-plus-circle"></i></a>
            <span><i class="fa fa-check"></i></span>
          </span>
        </li>
        <li v-if="filteredResults.length === 0"><i>Hittade inga fält...</i></li>
      </ul>
    </div>
  </div>
</template>

<style lang="less">
@modal-z: 950;
@black: #000000;
@neutral-color: #ffffff;
@gray: #949a9e;

.field-adder {
  display: inline-block; // So that the clickaway plugin triggers nicely
  >a {
    cursor: pointer;
  }
  .window {
    box-shadow: 0px 5px 15px 0px rgba(0,0,0,0.4);
    position: fixed;
    z-index: @modal-z;
    top: 100px;
    left: 25%;
    width: 50%;
    min-width: 600px;
    height: 400px;
    border: 1px solid @black;
    border-radius: 3px;
    background-color: @neutral-color;
    .header {
      background-color: @black;
      color: @neutral-color;
      height: 32px;
      padding-top: 2px;
      .title {
        display: inline-block;
        margin: 2px 0px 0px 5px;
        text-transform: uppercase;
      }
      .windowControl {
        float: right;
        padding: 1px 8px 0px 30px;
        display: inline-block;
        i:hover {
          cursor: pointer;
          color: darken(@neutral-color, 25%);
        }
      }
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
      max-height: 366px;
      overflow-y: auto;
      margin: 0px;
      li {
        &:nth-child(odd) {
          background-color: darken(@neutral-color, 5%);
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
