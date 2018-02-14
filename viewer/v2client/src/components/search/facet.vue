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
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    settings() {
      return this.$store.getters.settings;
    },
    determinedLabel() {
      let object = this.observation.object;
      if (object.hasOwnProperty('mainEntity')) {
        object = object.mainEntity;
      }
      if (typeof object.label !== 'undefined') {
        return object.label;
      } else if (typeof object.prefLabelByLang !== 'undefined' && typeof object.prefLabelByLang[this.user.settings.language] !== 'undefined') {
        return object.prefLabelByLang[this.user.settings.language];
      } else if (typeof object.labelByLang !== 'undefined' && typeof object.labelByLang[this.user.settings.language] !== 'undefined') {
        return object.labelByLang[this.user.settings.language];
      } else {
        const idArray = object['@id'].split('/');
        return `${idArray[idArray.length - 1]} (has no label)`;
      }
    },
  },
  components: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      
    });
  },
};
</script>

<template>
  <li class="facet-item">
    <router-link :to="observation.view['@id'] | asAppPath" :title="determinedLabel | capitalize">
      <span :title="determinedLabel | capitalize">
        {{determinedLabel | capitalize}}
      </span>
    </router-link>
    <span class="quantity">({{observation.totalItems}})</span>
  </li>
</template>

<style lang="less">

.facet-item {

}

</style>
