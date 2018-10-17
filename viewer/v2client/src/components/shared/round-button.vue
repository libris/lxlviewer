<script>
/*
This dumb component will render a round button.
Listen to the 'click' event in the parent as usual.

  Available props:
    * size  - 'medium' (default, 32px x 32px). TODO: 'small' & 'large'
    * color - 'gray' (default), 'primary', 'danger' & 'warning'.
    * disabled - bool, true will not emit the action.
    * icon - pass in a fa-name, i.e 'check'. Otherwise child node will render as text content
*/
export default {
  name: 'round-button',
  props: {
    size: {
        type: String,
        default: 'medium',
    },
    indicator: {
      type: Boolean,
      default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    buttonText: {
      type: String,
      default: '',
    },
    icon: {
        default: false,
    },
  },
  data() {
    return {
      mouseOver: false,
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
    smallText() {
      if (this.buttonText && this.buttonText.length > 3) {
        return true;
      }
      return false;
    },
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
    :class="`${disabled ? 'btn-gray disabled' : 'btn-primary'} ${indicator ? 'indicate-active': ''}`"
    @click="action()"
    @mouseover="mouseOver = true"
    @mouseout="mouseOver = false">
    <span v-if="icon">
        <i :class="`fa fa-${icon}`" aria-hidden="true"></i>
    </span>
    <span class="RoundButton-buttonText" :class="{'small-text': smallText }" v-else>{{ buttonText }}</span>
    <slot name="tooltip" v-if="mouseOver"></slot>
  </button>
</template>

<style lang="less">
.RoundButton {
  position: relative;
  margin-bottom: 10px;
  width: 32px;
  height: 32px;
  border: 2px solid;
  border-radius: 16px;
  justify-content: center;
  align-items: center;
  padding: 0;
  font-weight: 700;
  background-color: @neutral-color;
  border-color: @brand-primary;
  color: @brand-primary;
  transition: all 0.25s ease;
  &.disabled {
    color: @white;
    border-color: @gray-lighter;
  }
  &.indicate-active {
    background-color: @brand-primary;
    border-color: @brand-primary;
    color: @white;
  }
  &-buttonText {
    &.small-text {
      font-size: 85%;
    }
  }
  i {
    transition: transform 0.25s ease;
    &.rotate-45 {
      transform: rotate(45deg);
    }
  }
}

</style>
