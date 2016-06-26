<script>
import { mixin as clickaway } from 'vue-clickaway';

export default {
  mixins: [clickaway],
  name: 'field-adder',
  props: {
    allowed: {},
    active: false,
    filterKey: '',
    lang: 'sv',
  },
  computed: {
    filteredResults() {
      const filtered = [];
      if (!this.filterKey || this.filterKey.length < 1) {
        return this.allowed;
      }
      const fKey = this.filterKey.toLowerCase();
      for (let i = 0; i < this.allowed.length; i++) {
        if (
          this.allowed[i]['@id'].indexOf(fKey) !== -1 ||
          this.allowed[i]['note'].indexOf(fKey) !== -1
        ) {
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
      Filtrera: <input class="filterInput" type="text" v-model="filterKey"></input> <span class="small">(visar {{ filteredResults.length }} av totalt {{allowed.length}})</span>
    </div>
  <ul>
    <li v-for="prop in filteredResults">
      <span class="fieldLabel" title="{{prop['@id'] | labelByLang | capitalize }}">
        {{prop['@id'] | labelByLang | capitalize }}
      </span>
      <span class="typeLabel">({{ prop['@id'] }})</span>
      <a v-on:click="addField(prop)"><i class="fa fa-plus-circle"></i></a>
    </li>
    <li v-if="filteredResults.length === 0">Hittade inga fler fält</li>
  </ul>
</div>
</div>
</template>
