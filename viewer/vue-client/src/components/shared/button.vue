<script>
/*
This dumb component will render a button.
Listen to the 'click' event in the parent as usual.

  Available props:
    * size  - 'medium' (default, 32px x 32px). TODO: 'small'
    * color - 'grey' (default), 'primary', 'danger' & 'warning'.
    * disabled - bool, true will not emit the action.
    * icon - pass in a fa-name, i.e 'check'. Otherwise child node will render as text content
    * indicator - true gets an 'active' look
    * inverted - inverts the colors (so that main color is border and text instead of background)
    * active - true gives primary a permanent 'focused' look
    * label - (if icon) provide a string that will be translated & used as accessible label
    * shadow - (default: false) show a shadow under the button
*/
export default {
  name: 'button-component',
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
    shadow: {
      type: Boolean,
      default: false,
    },
    inverted: {
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
    active: {
      default: false,
    },
    label: {
      type: [String, Boolean, Array],
      default: false,
    },
  },
  data() {
    return {
      mouseOver: false,
    };
  },
  methods: {
    action() {
      if (!this.disabled) {
        this.$emit('click');
      }
    },
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
  <button class="Button"
    :class="[
      {
        'has-shadow': shadow, 
        'disabled' : disabled, 
        'Button-primary': indicator && !disabled, 
        'is-active': active,
        'is-inverted': inverted,
      },
      this.size ? 'Button-' + this.size : '',
    ]"
    @click="action()"
    @mouseover="mouseOver = true"
    @mouseout="mouseOver = false"
    :aria-label="label | translatePhrase">
    <span v-if="icon">
      <i :class="`fa fa-${icon}`" aria-hidden="true"></i>
    </span>
    <span class="Button-buttonText" :class="{'small-text': smallText }" v-else>{{ buttonText }}</span>
    <slot name="tooltip" v-if="mouseOver"></slot>
  </button>
</template>

<style lang="less">
.Button {
  position: relative;
  // margin: 5px;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
  padding: 0;
  font-weight: 700;
  font-size: 1.3rem;
  transition: all 0.25s ease;
  box-shadow: none;

  &-medium {
    width: 32px;
    height: 32px;
  }

  &-large {
    width: 36px;
    height: 36px;
  }

  &.has-shadow {
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.1);
  }

  // BUTTON COLOR MIXIN
  .ButtonMixin(@color) {
    border: 1px solid;
    border-color: transparent;
    background-color: @color;
    color: if((luma(@color) < 50), @white, @black);
    &:hover, &:active, &:focus {
      @hover-color: hsl(hue(@color), saturation(@color), lightness(@color)-5%);
      color: if((luma(@hover-color) < 50), @white, @black);
      background-color: @hover-color;
    }
    &:active {
      box-shadow: inset 0em 0em 0.75rem 0em fadeout(darken(@color, 60%), 75%);
    }
    &.is-inverted {
      border-color: @color;
      color: @color;
      background-color: @neutral-color;
      &:hover, &:active {
        @hover-color: hsl(hue(@color), saturation(@color), lightness(@color)-5%);
        color: @color;
        background-color: fadeout(@hover-color, 85%);
      }
      &:active {
        box-shadow: inset 0em 0em 0.75rem 0em fadeout(darken(@color, 60%), 75%);
      }
    }
    &.disabled {
      border-color: @grey-lighter !important;
      color: @grey !important;
      background-color: @grey-lighter !important;
      cursor: forbidden !important;
      &:hover, &:active {
        border-color: @grey-lighter !important;
        color: @grey !important;
        background-color: @grey-lighter !important;
        box-shadow: none !important;
      }
      &.is-inverted {
        border-color: @grey-lighter !important;
        color: @grey !important;
        background-color: @grey-lighter !important;
        &:hover, &:active {
          border-color: @grey-lighter !important;
          color: @grey !important;
          background-color: @grey-lighter !important;
          box-shadow: none !important;
        }
      }
    }
  }

  // Color
  &-default {
    .ButtonMixin(@brand-primary);
  }
  &-warning {
    .ButtonMixin(@brand-warning);
  }
  &-primary {
    .ButtonMixin(@brand-primary);
  }
  &-accent {
    .ButtonMixin(@brand-accent);
  }
  &-danger {
    .ButtonMixin(@brand-danger);
  }
  &-success {
    .ButtonMixin(@brand-success);
  }
  &-info {
    .ButtonMixin(@brand-info);
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
