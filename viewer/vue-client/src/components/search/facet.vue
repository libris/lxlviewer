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
  <li class="Facet">
    <router-link class="Facet-link"
      :to="observation.view['@id'] | asAppPath" 
      :title="determinedLabel | capitalize">
      <span class="Facet-label"
        :title="determinedLabel | capitalize">
        {{determinedLabel | capitalize}} 
        ({{observation.totalItems}})
      </span>
    </router-link>
  </li>
</template>

<style lang="less">

.Facet {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 2;

  &-link {
    font-size: 16px;
    font-size: 1.6rem;

    &:hover {
      color: inherit;
    }
  }

  &-label {
    cursor: pointer;
    color: @black;
  }
}

</style>
