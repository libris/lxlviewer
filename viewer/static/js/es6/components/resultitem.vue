<script>
import * as _ from 'lodash';

export default {
  name: 'result-item',
  props: {
    item: {},
  },
  computed: {
    title() {
      if (_.isArray(this.focus.hasTitle)) {
        return this.focus.hasTitle[0];
      } else {
        return this.focus.hasTitle;
      }
    },
    identifier() {
      if (_.isArray(this.focus.identifiedBy)) {
        return this.focus.identifiedBy[0];
      } else {
        return this.focus.identifiedBy;
      }
    },
    publication() {
      if (_.isArray(this.focus.publication)) {
        return this.focus.publication[0];
      } else {
        return this.focus.publication;
      }
    },
    focus() {
      return this.item.data['@graph'][1];
    },
  },
  methods: {

  },
  components: {

  },
};
</script>

<template>
  <li class="resultItem">
    <form method="POST" action="/edit">
    <div class="info">
      <span class="title">{{ title.mainTitle }}</span>
      {{ title.titleRemainder }} / {{ focus.responsibilityStatement }} ({{ publication.date }})
      <span v-if="identifier" class="identifier">{{ identifier['@type'] }} {{ identifier.value }}</span>
    </div>
    <div class="controls">
      <button type="submit" class="btn btn-xs btn-primary">Använd</button>
    </div>
    <textarea name="item" class="hidden">{{ item.data | json }}</textarea>
    </form>
  </li>
</template>
