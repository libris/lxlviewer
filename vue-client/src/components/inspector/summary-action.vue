<script>
import { mapGetters } from 'vuex';
import Button from '@/components/shared/button.vue';
import { translatePhrase } from '@/utils/filters';

export default {
  name: 'summary-action-button',
  props: {
    options: {
      show: false,
      styling: 'grey',
      text: 'button',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    replaced: {
      type: Boolean,
      default: false,
    },
    extracting: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
    };
  },
  emits: ['action'],
  methods: {
    translatePhrase,
    action() {
      this.$emit('action');
    },
  },
  computed: {
    ...mapGetters([
      'settings',
    ]),
    getIcon() {
      if (this.disabled) return 'check';
      if (this.replaced) return 'ban';
      if (this.options.icon) return this.options.icon;
      return false;
    },
    getTooltipText() {
      if (this.disabled) return 'Added';
      if (this.replaced) return 'Replaced';
      if (this.options.text) return this.options.text;
      return false;
    },
  },
  components: {
    'button-component': Button,
  },
  watch: {
  },
  mounted() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
  <div class="SummaryAction">
    <div class="SummaryAction-button">
      <button-component
        :disabled="disabled || replaced || extracting"
        :variant="options.styling"
        :icon="getIcon"
        :indicator="!disabled || !replaced"
        :label="getTooltipText"
        size="large"
        v-tooltip.right="translatePhrase(getTooltipText)"
        @click="action()"
        @keyup.enter="action()" />
    </div>
  </div>
</template>

<style lang="less">

.SummaryAction {
  display: flex;
  align-items: baseline;

  &-button {
    margin-top: 5px;

    .fa-stack-1x {
      color: @white;
    }
    .fa-stack-2x {
      transition: color 0.25s ease;
      color: @link-color;
    }
    &:hover {
      .fa-stack-2x {
        color: @link-hover-color;
      }
    }
  }
}
</style>
