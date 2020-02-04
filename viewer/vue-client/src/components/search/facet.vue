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
    getByLang(object, property, lang) {
      const langDict = object[`${property}ByLang`];
      if (typeof langDict === 'object' && typeof langDict[lang] === 'string') {
        return langDict[lang];
      }
      return object[property];
    },
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
      const lang = this.user.settings.language;

      // TODO: Add chip functionality instead?
      const label = this.getByLang(object, 'prefLabel', lang)
        || this.getByLang(object, 'label', lang)
        || this.getByLang(object, 'title', lang);
      if (label) {
        return label;
      }
      
      const idArray = object['@id'].split('/');
      return `${idArray[idArray.length - 1]} [has no label]`;
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
  font-size: 1.4rem;

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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

</style>
