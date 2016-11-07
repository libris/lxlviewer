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
  <div class="fieldAdder">
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
