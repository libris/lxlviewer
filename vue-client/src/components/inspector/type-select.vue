<script>
import * as LayoutUtil from '@/utils/layout';
import { translatePhrase } from '@/utils/filters';

export default {
  name: 'type-select',
  props: {
    classTree: {
      type: Array,
    },
    options: {
      type: Array,
    },
    removeable: {
      type: Boolean,
    },
  },
  data() {
    return {
      selectedType: '',
      highlight: false,
    };
  },
  emits: ['selected', 'dismiss'],
  methods: {
    translatePhrase,
    handleChange() {
      this.$emit('selected', this.selectedType);
    },
    dismiss() {
      this.$emit('dismiss');
    },
    scrollToEl() {
      const element = this.$el;
      LayoutUtil.scrollToElement(element, 1000, () => {});
    },
  },
  computed: {
  },
  components: {
  },
  watch: {
  },
  mounted() {
    this.$nextTick(() => {
      this.scrollToEl();
      LayoutUtil.enableTabbing();
      this.$refs.adderTypeSelect.focus();
    });
  },
};
</script>

<template>
  <div
    class="TypeSelect"
    :class="{ 'is-removeable': highlight }">
    <select
      class="customSelect"
      v-model="selectedType"
      ref="adderTypeSelect"
      @change="handleChange()"
      :aria-label="translatePhrase('Choose type')">
      <option disabled value="">{{ translatePhrase("Choose type") }}</option>
      <option
        v-for="(term, index) in classTree"
        v-html="options[index].label"
        :disabled="term.abstract"
        :key="`${term.id}-${index}`"
        :value="term.id" />
    </select>
    <div class="TypeSelect-dismissBtn" v-if="removeable">
      <i
        class="fa fa-times-circle icon icon--sm"
        role="button"
        tabindex="0"
        :aria-label="translatePhrase('Remove')"
        @click="dismiss()"
        @keyup.enter="dismiss()"
        @mouseover="highlight = true"
        @mouseout="highlight = false"
        @focus="highlight = true"
        @blur="highlight = false" />
    </div>
  </div>
</template>

<style lang="less">
.TypeSelect {
  max-width: 200px;
  padding: 5px;
  display: flex;
  border-radius: 4px;
  transition: background-color .3s ease;

  &-dismissBtn {
    margin-left: 10px;
    align-items: center;
    display: flex;
  }

  &.is-removeable {
    background-color: @remove;
  }
}
</style>
