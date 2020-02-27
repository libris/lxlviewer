<script>
/*
This dumb component will render a button.
Listen to the 'click' event in the parent as usual.

  Available props:
    * size  - 'medium' (default, 32px x 32px). TODO: 'small'
    * color - 'gray' (default), 'primary', 'danger' & 'warning'.
    * disabled - bool, true will not emit the action.
    * icon - pass in a fa-name, i.e 'check'. Otherwise child node will render as text content
    * indicator - true gets an 'active' look
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
  <button class="Button btn"
    :class="[
      {
        'has-shadow': shadow, 
        'btn-gray disabled' : disabled, 
        'default': !indicator && !disabled, 
        'btn-primary': indicator && !disabled, 
        'is-active': active,      
      },
      this.size ? 'btn-' + this.size : '',
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

  &.btn-medium {
    width: 32px;
    height: 32px;
  }

  &.btn-large {
    width: 36px;
    height: 36px;
  }

  &.has-shadow {
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.1);
  }

  &.default {
  background-color: @neutral-color;
  color: @btn-primary;
  border: 2px solid @btn-primary;

    &:hover {
      border-color: @btn-primary--hover; 
      color: @btn-primary--hover;
    }
  }

  &.btn-primary.is-active {
    background-color: @btn-primary--hover; 
    border: @btn-primary--hover;
  }

  &.disabled { //can't be SUIT-ified because inherits from Bootstrap .disabled
    color: @grey;
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
