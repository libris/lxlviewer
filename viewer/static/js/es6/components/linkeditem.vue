<script>
import * as _ from 'lodash';
import ProcessedLabel from './processedlabel';

export default {
  name: 'linked-item',
  props: {
    item: {},
    key: '',
    index: Number,
  },
  computed: {
  },
  methods: {
    removeThis() {
      const holder = this.$parent.value;
      if (_.isArray(holder)) {
        this.$parent.removeByIndex(this.index);
      } else if (_.isPlainObject(holder)) {
        this.$parent.removeKey(this.key);
      } else {
        this.$parent.emptyValue();
      }
    },
  },
  components: {
    'processed-label': ProcessedLabel,
  },
};
</script>

<template id="linked-item">
  <div class="linked">
    <a href="{{item['@id']}}">
      <processed-label :item="item" language="${lang}"></processed-label>
    </a> <i class="fa fa-close" v-on:click="removeThis()"></i>
    <div class="linked-popup">
      <div class="arrow"></div>
      <p class="pull-left">{{item.label }}</p>
      <p class="pull-right">{{ item['@type'] }}</p>
      <br><hr>
      <p>{{ item['@id'] }}</p>
    </div>
  </div>
</template>
