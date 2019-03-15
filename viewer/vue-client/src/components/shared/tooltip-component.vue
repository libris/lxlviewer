<script>
import * as StringUtil from '@/utils/string';
import * as LayoutUtil from '@/utils/layout';

export default {
  data() {
    return {
      hoverTooltip: false,
    };
  },
  props: {
    tooltipText: {
      type: [String, Array],
      default: '',
    },
    showTooltip: {
      type: Boolean,
      default: false,
    },
    keybindName: {
      type: String,
      default: '',
    },
    position: {
      default: 'top',
      type: String,
    },
  },
  components: {
  },
  watch: {
  },
  computed: {
    settings() {
      return this.$store.getters.settings;
    },
    resources() {
      return this.$store.getters.resources;
    },
    compShowTooltip() {
      return !this.hoverTooltip && this.showTooltip;
    },
    translatedText() {
      return StringUtil.getUiPhraseByLang(this.tooltipText, this.settings.language);
    },
    keybindingText() {
      let str = '';
      if (this.keybindName) {
        str = ` (${LayoutUtil.getKeybindingText(this.keybindName)})`;
      }
      return str;
    },
  },
  ready() {
  },
  methods: {
  },
};
</script>

<template>
  <div class="tooltip-container-outer" 
    :class="{ 'show-tooltip': compShowTooltip, 'is-onLeft': position == 'left', 'is-onTop': position == 'top', 'is-onRight': position == 'right' }" 
    @mouseover="hoverTooltip = true" 
    @mouseleave="hoverTooltip = false">
    <div class="tooltip-container-inner">
      {{ translatedText + keybindingText }}
    </div>
  </div>
</template>

<style lang="less">

.tooltip-container-outer {
  position: absolute;
  visibility: hidden;
  opacity: 0;
  transition: all 0.1s ease;
  display: none;

  &:after {
    position: absolute;
    pointer-events: none;
    border: solid transparent;
    border-width: 6px;
    content: " ";
  }

  &.is-onLeft {
    right: 100%;
    margin-right: 10px;
    transform: none;
    top: 15%;
    &:after {
      left: 100%;
      right: auto;
      bottom: auto;
      top: 50%;
      width: 8px;
      margin-top: -6px;
      border-left-color: @black;
      border-width: 6px;
      margin-left: -1px;
    }
  }
  &.is-onTop {
    transform: translate(-50%, -50px);
    &::after {
      left: 50%;
      height: 0;
      width: 0;
      pointer-events: none;
      border-top-color: @black;
      margin-left: 3px;
    }
  }

  &.is-onRight {
    left: 100%;
    margin-left: 10px;
    transform: none;
    top: 0;
    z-index: 99;

    &:after {
      right: 100%;
      left: auto;
      bottom: auto;
      top: 50%;
      width: 8px;
      margin-top: -6px;
      border-left-color: @black;
      border-width: 6px;
      margin-left: -1px;
      transform: rotate(180deg);
    }
  }

  .tooltip-container-inner {
    background-color: @black;
    white-space: nowrap;
    text-transform: none;
    color: @white;
    padding: 5px 7px;
    border-radius: 3px;
    text-align: center;
    font-family: @font-family-base;
    font-size: 14px;
    font-weight: bold;
    -webkit-text-stroke: 0;
  }
  &.show-tooltip {
    opacity: 1;
    transition-delay: 0.2s;
    visibility: visible;
    display:block;
    z-index: 4;
  }
}


</style>
