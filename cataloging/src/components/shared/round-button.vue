<script>
/*
This dumb component will render a round button.
Listen to the 'click' event in the parent as usual.

  Available props:
    * size  - 'medium' (default, 32px x 32px). TODO: 'small' & 'large'
    * color - 'grey' (default), 'primary', 'danger' & 'warning'.
    * disabled - bool, true will not emit the action.
    * icon - pass in a fa-name, i.e 'check'. Otherwise child node will render as text content
    * indicator - true gets an 'active' look
    * active - true gives primary a permanent 'focused' look
    * label - (if icon) provide a string that will be translated & used as accessible label
*/

import { translatePhrase } from '@/utils/filters';

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
  <button
    type="button"
    class="RoundButton btn"
    :class="{
      'btn-grey disabled': disabled, default: !indicator && !disabled, 'btn-primary': indicator && !disabled, 'is-active': active,
    }"
    @click="action()"
    @mouseover="mouseOver = true"
    @mouseout="mouseOver = false"
    :aria-label="translatePhrase(label)">
    <span v-if="icon">
      <i :class="`fa fa-${icon}`" aria-hidden="true" />
    </span>
    <span class="RoundButton-buttonText" :class="{ 'small-text': smallText }" v-else>{{ buttonText }}</span>
    <slot name="tooltip" v-if="mouseOver" />
  </button>
</template>

<style lang="less">
.RoundButton {
  position: relative;
  margin: 5px;
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
