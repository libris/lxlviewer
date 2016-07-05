<script>
import { mixin as clickaway } from 'vue-clickaway';
import * as _ from 'lodash';

export default {
  mixins: [clickaway],
  name: 'field-adder',
  props: {
    allowed: {},
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
        const pId = this.allowed[i]['@id'].toString().toLowerCase();
        const pNote = this.allowed[i]['note'].toString().toLowerCase();
        let pLabel = '';
        if (typeof this.allowed[i].labelByLang !== 'undefined' && typeof this.allowed[i].labelByLang[this.lang] !== 'undefined') {
          if (_.isArray(this.allowed[i].labelByLang[this.lang])) {
            pLabel = this.allowed[i].labelByLang[this.lang][0];
          } else {
            pLabel = this.allowed[i].labelByLang[this.lang];
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
      this.filterKey = '';
      this.active = true;
    },
    hide() {
      this.active = false;
    },
  },
  components: {
  },
};
</script>

<template>
  <div class="fieldAdder" v-on-clickaway="hide">
  <a v-on:click="show"><i class="fa fa-plus-circle"></i> Lägg till fält</a>
  <div class="window" v-show="active">
    <div class="filter">
      Filtrera <input class="filterInput" type="text" v-model="filterKey" debounce="150"></input> <span class="filterInfo">Visar {{ filteredResults.length }} av totalt {{allowed.length}}</span>
    </div>
  <ul>
    <li v-for="prop in filteredResults">
      <span class="fieldLabel" title="{{prop['@id'] | labelByLang | capitalize }}">
        {{prop['@id'] | labelByLang | capitalize }}
      </span>
      <span class="typeLabel">{{ prop['@id'] }}</span>
      <a v-on:click="addField(prop)"><i class="fa fa-plus-circle"></i></a>
    </li>
    <li v-if="filteredResults.length === 0">Hittade inga fler fält</li>
  </ul>
</div>
</div>
</template>
