<script>
import * as _ from 'lodash';

export default {
  name: 'result-item',
  props: {
    item: {},
  },
  computed: {
    title() {
      if (_.isArray(this.item.hasTitle)) {
        return this.item.hasTitle[0];
      } else {
        return this.item.hasTitle;
      }
    },
    identifier() {
      if (_.isArray(this.item.identifiedBy)) {
        return this.item.identifiedBy[0];
      } else {
        return this.item.identifiedBy;
      }
    },
    publication() {
      if (_.isArray(this.item.publication)) {
        return this.item.publication[0];
      } else {
        return this.item.publication;
      }
    }
  },
  methods: {

  },
  components: {

  },
};
</script>

<template>
  <li class="resultItem">
    <a href="#"><span class="title">{{ title.mainTitle }}</span> {{ title.titleRemainder }} / {{ item.responsibilityStatement }} ({{ publication.date }})
    <span class="identifier">{{ identifier.value }}</span></a>
  </li>
</template>
