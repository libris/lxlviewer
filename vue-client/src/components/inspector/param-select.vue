<script>
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
import * as LayoutUtil from '@/utils/layout';
import PropertyMappings from '@/resources/json/propertymappings.json';
import { translatePhrase } from '@/utils/filters';

export default {
  name: 'param-select',
  props: {
    types: {
      type: Array,
    },
    reset: {
      type: Number,
    },
    userPrefKey: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      selectedParam: '',
    };
  },
  emits: ['param-selected'],
  methods: {
    translatePhrase,
    handleChange() {
      this.$emit('param-selected', this.selectedParam);
      this.setUserPref(this.selectedParam);
    },
    resetSelectValue() {
      if (!this.availableSearchParams.includes(this.selectedParam)) {
        const pref = this.getUserPref();
        if (this.availableSearchParams.includes(pref)) {
          this.selectedParam = pref;
        } else if (this.availableSearchParams.length > 0) {
          this.selectedParam = this.availableSearchParams[0];
        }
      }
    },
    setUserPref(param) {
      if (this.isUserPrefEnabled()) {
        this.user.settings[`searchParam-${this.userPrefKey}`] = param;
        this.$store.dispatch('setUser', this.user);
      }
    },
    getUserPref() {
      return this.isUserPrefEnabled()
        ? this.user.settings[`searchParam-${this.userPrefKey}`]
        : undefined;
    },
    isUserPrefEnabled() {
      return this.userPrefKey !== undefined
        && this.userPrefKey !== null
        && this.userPrefKey.length > 0;
    },
  },
  computed: {
    ...mapGetters([
      'resources',
      'user',
    ]),
    baseClasses() {
      if (this.types === undefined || this.types.includes(undefined) || this.types.length === 0) {
        return [];
      }

      return VocabUtil.getBaseClassesFromArray(
        this.types,
        this.resources.vocab,
        this.resources.context,
      );
    },
    availableSearchParams() {
      const intersects = ((a1, a2) => a1.find((value) => a2.includes(value)) !== undefined);

      if (this.types === [] || this.types === undefined) {
        return PropertyMappings;
      }

      const types = this.types.concat(this.baseClasses);
      return PropertyMappings.filter((m) => intersects(m.types, types));
    },
  },
  components: {
  },
  watch: {
    types() {
      this.resetSelectValue();
    },
    reset() {
      this.resetSelectValue();
    },
  },
  mounted() {
    this.$nextTick(() => {
      LayoutUtil.enableTabbing();
    });
  },
};
</script>

<template>
  <div class="ParamSelect">
    <select
      class="SearchForm-paramSelect SearchForm-select customSelect"
      v-model="selectedParam"
      @change="handleChange()"
      :aria-label="translatePhrase('Choose type')">
      <option
        v-for="prop in availableSearchParams"
        :key="prop.key"
        :value="prop">
        {{ translatePhrase(prop.key) }}
      </option>
    </select>
  </div>
</template>

<style lang="less">
.ParamSelect {
  display: flex;
}
</style>
