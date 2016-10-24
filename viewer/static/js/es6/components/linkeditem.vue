<script>
import * as _ from 'lodash';
import ProcessedLabel from './processedlabel';

export default {
  name: 'linked-item',
  props: {
    item: {},
    key: '',
    index: Number,
    isLocked: false,
  },
  data: function() {
    return {
      focused: false,
    }
  },
  computed: {
  },
  methods: {
    removeThis() {
      const holder = this.$parent.value;
      if (_.isArray(holder)) {
        this.$parent.removeById(this.item['@id']);
      } else if (_.isPlainObject(holder)) {
        this.$parent.removeKey(this.key);
      } else {
        this.$parent.emptyValue();
      }
    },
    addFocus() {
      this.focused = true;
    },
    removeFocus() {
      this.focused = false;
    },
  },
  components: {
    'processed-label': ProcessedLabel,
  },
};
</script>

<template id="linked-item">
  <div class="link-container" v-bind:class="{'focused': focused}">
    <div class="linked">
      <processed-label :item="item"></processed-label>
      <i class="delete fa fa-close" v-on:click="removeThis()" v-if="!isLocked"></i>
    </div>
    <div class="linked-popup">
      <div class="header">
        <span class="item-label"><a v-on:focus="addFocus" v-on:blur="removeFocus" href="{{ item['@id'] }}"><processed-label :item="item"></processed-label></a></span>
        <span class="item-type text-right" v-if="item['@type']">{{ item['@type'] | labelByLang }}</span>
        <span class="item-type text-right unknown" v-if="!item['@type']">OKÄND TYP</span>
      </div>
      <div class="body">
        <p v-for="(k, v) in item" v-if="k !== '@id' && k !== '@type'"><b>{{ k }}:</b> {{ v | json }}</p>
      </div>
    </div>
  </div>
</template>
