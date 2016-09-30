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
  data() {
    return {
      popup: {
        active: false,
      }
    }
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
  <div class="link-container">
    <div class="linked">
      <a href="{{item['@id']}}">
        <processed-label :item="item"></processed-label>
      </a> <i class="delete fa fa-close" v-on:click="removeThis()"></i>
    </div>
    <div class="linked-popup">
      <div class="header">
        <span class="item-label"><a href="{{ item['@id'] }}"><processed-label :item="item"></processed-label></a></span>
        <span class="item-type text-right" v-if="item['@type']">{{ item['@type'] | labelByLang }}</span>
        <span class="item-type text-right unknown" v-if="!item['@type']">OKÄND TYP</span>
      </div>
      <div class="body">
        <p v-for="(k, v) in item" v-if="k !== '@id' && k !== '@type'"><b>{{ k }}:</b> {{ v | json }}</p>
      </div>
    </div>
  </div>
</template>
