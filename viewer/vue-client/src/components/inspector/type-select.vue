<script>
import * as LayoutUtil from '@/utils/layout';

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
  methods: {
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
  <div class="TypeSelect"
    :class="{'is-removeable': highlight}">
    <select class="customSelect" 
      v-model="selectedType"
      ref="adderTypeSelect"
      @change="handleChange()"
      :aria-label="'Choose type' | translatePhrase">
      <option disabled value="">{{"Choose type" | translatePhrase}}</option>
      <option v-for="(term, index) in classTree"  
        v-html="options[index].label"
        :disabled="term.abstract" 
        :key="`${term.id}-${index}`" 
        :value="term.id"></option>
    </select>
    <div class="TypeSelect-dismissBtn" v-if="removeable">
      <i class="fa fa-times-circle icon icon--sm" 
        role="button"
        tabindex="0"
        :aria-label="'Remove' | translatePhrase"
        @click="dismiss()"
        @keyup.enter="dismiss()"
        @mouseover="highlight = true"
        @mouseout="highlight = false"
        @focus="highlight = true"
        @blur="highlight = false">
      </i>
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
