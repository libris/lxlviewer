<script>
import { mixin as clickaway } from 'vue-clickaway';
import * as _ from 'lodash';
import * as LayoutUtil from '../utils/layout';

export default {
  mixins: [clickaway],
  name: 'field-adder',
  props: {
    allowed: [],
    active: false,
    filterKey: '',
    lang: '',
  },
  computed: {
    filteredResults() {
      const filtered = [];
      if (!this.filterKey || this.filterKey.length < 1) {
        return this.allowed;
      }
      const fKey = this.filterKey.toLowerCase();
      for (let i = 0; i < this.allowed.length; i++) {
        const pId = this.allowed[i].item['@id'].toString().toLowerCase();
        const pNote = this.allowed[i].item['note'].toString().toLowerCase();
        let pLabel = '';
        if (typeof this.allowed[i].item.labelByLang !== 'undefined' && typeof this.allowed[i].item.labelByLang[this.lang] !== 'undefined') {
          if (_.isArray(this.allowed[i].item.labelByLang[this.lang])) {
            pLabel = this.allowed[i].item.labelByLang[this.lang][0];
          } else {
            pLabel = this.allowed[i].item.labelByLang[this.lang];
          }
        }
        pLabel = pLabel.toLowerCase();
        if (pId.indexOf(fKey) !== -1 || pNote.indexOf(fKey) !== -1 || pLabel.indexOf(fKey) !== -1) {
          filtered.push(this.allowed[i]);
        }
      }
      return filtered;
    },
  },
  methods: {
    addField(prop) {
      return this.$parent.addField(prop);
    },
    show() {
      LayoutUtil.scrollLock(true);
      const self = this;
      setTimeout(() => {
        self.active = true;
      }, 50);

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
    <a v-on:click.prevent="show"><i class="fa fa-plus-circle"></i> Lägg till fält</a>
    <div class="window" v-show="active" v-on-clickaway="hide">
      <div class="header">
        <span class="title">
          Lägg till fält
        </span>
        <span class="filter">
          Filtrera <input class="filterInput" type="text" v-model="filterKey" debounce="150"></input> <span class="filterInfo">Visar {{ filteredResults.length }} av totalt {{allowed.length}}</span>
        </span>
      </div>
      <ul v-if="active">
        <li v-bind:class="{ 'added': prop.isAdded }" v-for="prop in filteredResults">
          <span class="fieldLabel" title="{{prop.item['@id'] | labelByLang | capitalize }}">
            {{prop.item['@id'] | labelByLang | capitalize }}
          </span>
          <span class="typeLabel">{{ prop.item['@id'] }}</span>
          <span class="addControl">
            <a v-on:click="addField(prop.item)"><i class="fa fa-plus-circle"></i></a>
            <span><i class="fa fa-check"></i></span>
          </span>
        </li>
        <li v-if="filteredResults.length === 0">Hittade inga fler fält</li>
      </ul>
    </div>
  </div>
</template>
