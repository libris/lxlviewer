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
import { isArray } from 'lodash-es';
import { translatePhrase } from '@/utils/filters';

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
    variant: {
      type: String,
      default: 'info',
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
    transparent: {
      type: Boolean,
      default: false,
    },
    border: {
      type: [Boolean, String],
      default: true,
    },
    buttonText: {
      type: [String, Array],
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
  emits: ['click'],
  methods: {
    translatePhrase,
    action() {
      if (!this.disabled) {
        this.$emit('click');
      }
    },
  },
  computed: {
    computedLabel() {
      return this.disabled ? '' : translatePhrase(this.label);
    },
    computedButtonText() {
      if (isArray(this.buttonText)) {
        let buttonText = '';
        for (let i = 0; i < this.buttonText.length; i++) {
          buttonText += translatePhrase(this.buttonText[i]);
          buttonText += ' ';
        }
        return buttonText;
      }
      return translatePhrase(this.buttonText);
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
  <button
    class="Button"
    v-tooltip.top="computedLabel"
    :class="[
      {
        'has-shadow': shadow,
        'has-no-border': border === false,
        disabled: disabled,
        'Button-primary': indicator && !disabled,
        'is-active': active,
        'is-inverted': inverted,
        'is-transparent': transparent,
        'is-wide': buttonText,
      },
      this.size ? 'Button-' + this.size : '',
      this.variant ? 'Button-' + this.variant : '',
    ]"
    @click="action()"
    :aria-label="computedLabel">
    <span v-if="icon">
      <i :class="`fa fa-fw fa-${icon}`" aria-hidden="true" />
    </span>
    <span class="Button-buttonText" v-if="computedButtonText">{{ computedButtonText }}</span>
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
    i.fa {
      font-size: 1.6rem;
    }
    width: 36px;
    height: 36px;
  }

  &.is-wide {
    width: auto;
    padding: 0 0.5em;
  }

  &.has-no-border {
    border: 0;
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
    &.is-transparent {
      background-color: transparent;
    }
    &.disabled {
      border-color: @grey-lighter !important;
      color: @grey !important;
      background-color: @grey-lighter !important;
      cursor: not-allowed !important;
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
  &-accent2 {
    .ButtonMixin(@brand-accent2);
  }
  &-accent3 {
    .ButtonMixin(@brand-accent3);
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

  i {
    transition: transform 0.25s ease;
    &.rotate-45 {
      transform: rotate(45deg);
    }
  }
}

</style>
