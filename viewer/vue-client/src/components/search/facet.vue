<script>
import * as MathUtil from '@/utils/math';

export default {
  name: 'facet',
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    observation: {},
  },
  data() {
    return {
    };
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
      } if (typeof object.prefLabelByLang !== 'undefined' && typeof object.prefLabelByLang[this.user.settings.language] !== 'undefined') {
        return object.prefLabelByLang[this.user.settings.language];
      } if (typeof object.labelByLang !== 'undefined' && typeof object.labelByLang[this.user.settings.language] !== 'undefined') {
        return object.labelByLang[this.user.settings.language];
      } 
      const idArray = object['@id'].split('/');
      return `${idArray[idArray.length - 1]} (has no label)`;
    },
    getCompactNumber() {
      return MathUtil.getCompactNumber(this.observation.totalItems);
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
    <slot name="icon"></slot>
    <router-link class="Facet-link"
      :to="observation.view['@id'] | asAppPath" 
      :title="determinedLabel | capitalize">
      <span class="Facet-label"
        :title="determinedLabel | capitalize">
        {{determinedLabel | capitalize}}</span>
      <span class="Facet-badge badge">{{getCompactNumber}}</span>
    </router-link>
  </li>
</template>

<style lang="less">

.Facet {
  display: flex;
  align-items: center;

  &-link {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;

    &:hover {
      text-decoration: none;
      & .Facet-label {
        text-decoration: underline;
      }
    }
  }

  &-badge {
    min-width: auto;
  }

  &-label {
    cursor: pointer;
    margin-right: 10px;
    color: @black;
    line-height: 1.8em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

</style>
