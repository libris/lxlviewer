<script>
import * as httpUtil from '../utils/http';
export default {
  name: 'facet',
  props: {
    active: false,
    observation: {},
  },
  data() {
    return {
    }
  },
  methods: {
    activeChanged() {
      if (this.active) {
        const resultPromise = new Promise((resolve, reject) => {
          httpUtil.get({ url: this.observation.view['@id'], accept: 'application/ld+json' }).then((response) => {
            resolve(response);
          }, (error) => {
            reject('Error searching...', error);
          });
        });
        this.$dispatch('newresult', resultPromise);
      }
    },
    toggleActive() {
      this.active = !this.active;
    }
  },
  computed: {
    determinedLabel() {
      const object = this.observation.object;
      if (typeof object.label !== 'undefined') {
        return object.label;
      } else if (typeof object.prefLabelByLang !== 'undefined' && typeof object.prefLabelByLang.sv !== 'undefined') {
        return object.prefLabelByLang.sv;
      } else if (object.labelByLang !== 'undefined' && object.labelByLang.sv !== 'undefined') {
        return object.labelByLang.sv;
      }
    },
  },
  components: {
  },
  watch: {
    'active': function() {this.activeChanged();},
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <li>
    <span @click="toggleActive">
      <input type="checkbox" v-model="active">
      <span title="determinedLabel">
        {{determinedLabel}}
      </span>
    </span>
    <span class="quantity">({{observation.totalItems}})</span>
  </li>
</template>

<style lang="less">
@import './_variables.less';

</style>
