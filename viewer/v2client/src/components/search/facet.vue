<script>
import * as httpUtil from '@/utils/http';

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
        this.changeResultListStatus('loading', true);
        const resultPromise = new Promise((resolve, reject) => {
          httpUtil.get({ url: `${location.origin}${this.observation.view['@id']}`, accept: 'application/ld+json' }).then((response) => {
            history.pushState(response, 'unused', response['@id']);
            console.log(response);
            resolve(response);
          }, (error) => {
            history.pushState({}, 'unused', this.observation.view['@id']);
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
      let object = this.observation.object;
      if (object.hasOwnProperty('mainEntity')) {
        object = object.mainEntity;
      }
      if (typeof object.label !== 'undefined') {
        return object.label;
      } else if (typeof object.prefLabelByLang !== 'undefined' && typeof object.prefLabelByLang[this.settings.language] !== 'undefined') {
        return object.prefLabelByLang[this.settings.language];
      } else if (typeof object.labelByLang !== 'undefined' && typeof object.labelByLang[this.settings.language] !== 'undefined') {
        return object.labelByLang[this.settings.language];
      } else {
        const idArray = object['@id'].split('/');
        return `${idArray[idArray.length - 1]} (has no label)`;
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
    <a v-if="!historySupported" :href="observation.view['@id']" :title="determinedLabel | capitalize">{{determinedLabel | capitalize}}</a>
    <a v-if="historySupported" @click.prevent="toggleActive" :href="observation.view['@id']" :title="determinedLabel | capitalize">
      <input type="checkbox" v-model="active">
      <span :title="determinedLabel | capitalize">
        {{determinedLabel | capitalize}}
      </span>
    </a>
    <span class="quantity">({{observation.totalItems}})</span>
  </li>
</template>

<style lang="less">
@import '../shared/_variables.less';

.facet-item {
  input[type=checkbox] {
    visibility: hidden;
  }
}

</style>
