<script>
import { mapGetters } from 'vuex';

export default {
  name: 'check-box',
  props: {
    checkedProperty: {
      type: String,
      default: '',
    },
    tooltipText: {
      type: String,
      default: '',
    },
    isChosen: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
    };
  },
  methods: {
    onChange(e) {
      this.$emit('changed', e);
      // emit on change and let the parent handle it.
    },
  },
  computed: {
    ...mapGetters([
      'resources',
    ]),
  },
  components: {
  },
  mounted() {
    this.$nextTick(() => {});
  },
};
</script>

<template>
  <div class="TypeIcon">
    <input id="test" class="customCheckbox-input" type="checkbox" @change="onChange" :checked="isChosen">
    <div class="customCheckbox-icon"></div>
  </div>
</template>

<style lang="less">
.TypeIcon {
  background-color: @grey-lightest;
  color: @brand-primary;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  height: 20px;
  border-radius: 0.25rem;
  margin-right: 5px;
  font-size: 12px;

  &-label {
    font-weight: 800;
  }
}

</style>
