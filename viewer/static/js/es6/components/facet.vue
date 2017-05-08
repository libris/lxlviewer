<script>
import * as httpUtil from '../utils/http';
import { changeResultListStatus } from '../vuex/actions';
export default {
  name: 'facet',
  vuex: {
    actions: {
      changeResultListStatus,
    },
  },
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
        this.changeResultListStatus('loading', true);
        const resultPromise = new Promise((resolve, reject) => {
          httpUtil.get({ url: this.observation.view['@id'], accept: 'application/ld+json' }).then((response) => {
            history.pushState(response, "title", this.observation.view['@id']);
            resolve(response);
          }, (error) => {
            history.pushState({}, "title", this.observation.view['@id']);
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
    historySupported() {
      if (Modernizr.history) {
        return true;
      } else {
        return false;
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
      
    });
  },
};
</script>

<template>
  <li class="facet-item">
    <a v-if="!historySupported" href="{{observation.view['@id']}}" title="{{determinedLabel}}">{{determinedLabel}}</a>
    <span v-if="historySupported" @click="toggleActive">
      <input type="checkbox" v-model="active">
      <span title="{{determinedLabel}}">
        {{determinedLabel}}
      </span>
    </span>
    <span class="quantity">({{observation.totalItems}})</span>
  </li>
</template>

<style lang="less">
@import './_variables.less';

.facet-item {
  input[type=checkbox] {
    visibility: hidden;
  }
}

</style>
