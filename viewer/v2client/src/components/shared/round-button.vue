<script>

export default {
  name: 'round-button',
  props: {
      size: {
          type: String,
          default: 'medium',
      },
      color: {
          type: String,
          default: 'gray'
      },
      disabled: {
          type: Boolean,
          default: false,
      },
      icon: {
          default: false,
      }
  },
  methods: {
    action() {
        if (!this.disabled) {
            this.$emit('click')
        }
    }
  },
  computed: {
  },
  components: {
  },
  watch: {
  },
  mounted() {
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
    <button class="RoundButton btn"
        :class="`btn-${color}`"
        @click="action()"
        :disabled="disabled" >
        <span v-if="icon">
            <i :class="`fa fa-${icon}`"></i>
        </span>
        <slot v-else></slot>
    </button>
</template>

<style lang="less">
.RoundButton {
    margin-bottom: 10px;
    width: 32px;
    height: 32px;
    border-radius: 16px;
    justify-content: center;
    align-items: center;
    padding: 0;
    font-weight: 700;

    & .disabled {
        
    }
}

</style>
