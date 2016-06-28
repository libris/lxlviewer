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
    <h2>{{ title.mainTitle }}</h2>
    {{ title.titleRemainder }}
  </li>
</template>
