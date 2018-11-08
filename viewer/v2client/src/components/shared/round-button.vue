<script>
/*
This dumb component will render a round button.
Listen to the 'click' event in the parent as usual.

  Available props:
    * size  - 'medium' (default, 32px x 32px). TODO: 'small' & 'large'
    * color - 'gray' (default), 'primary', 'danger' & 'warning'.
    * disabled - bool, true will not emit the action.
    * icon - pass in a fa-name, i.e 'check'. Otherwise child node will render as text content
    * indicator - true gets an 'active' look
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
    this.$nextTick(() => {});
  },
};
</script>

<template>
  <button class="RoundButton btn"
    :class="{'btn-gray is-disabled' : disabled, 'default': !indicator && !disabled, 'btn-primary': indicator && !disabled}"
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
  border-radius: 16px;
  justify-content: center;
  align-items: center;
  padding: 0;
  font-weight: 700;
  transition: all 0.25s ease;

  &.default {
  background-color: @neutral-color;
  color: @brand-primary;
  border: 2px solid @brand-primary;

    &:hover {
      border-color: @link-hover-color; 
      color: @link-hover-color;
    }
  }

  .is-highlighted & {
    background-color: @link-hover-color; 
    border-color: @link-hover-color; 
    color: @white;
  }

  &.is-disabled {
    color: @white;
    border: none;
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
