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
    tooltipText: '',
    translation: '',
    showTooltip: false,
    keybindName: '',
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
      if (this.translation === 'labelByLang') {
        return StringUtil.getLabelByLang(this.tooltipText, this.settings.language, this.resources.vocab, this.resources.context);
      } else if (this.translation === 'translatePhrase') {
        return StringUtil.getUiPhraseByLang(this.tooltipText, this.settings.language);
      } else {
        return this.tooltipText;
      }
    },
    keybindingText() {
      let str = '';
      if (this.keybindName) {
        str = LayoutUtil.getKeybindingText(this.keybindName);
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
  <div class="tooltip-container-outer" :class="{ 'show-tooltip': compShowTooltip, 'is-onLeft': position == 'left', 'is-onTop': position == 'top' }" @mouseover="hoverTooltip = true" @mouseleave="hoverTooltip = false">
    <div class="tooltip-container-inner" >
      {{translatedText | capitalize}}{{ keybindingText ? ` (${keybindingText})` : ''}}
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
    right: 50px;
    margin-right: 10px;
    transform: none;
    top: 10px;
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

  .tooltip-container-inner {
    background-color: @black;
    white-space: nowrap;
    text-transform: none;
    color: @white;
    padding: 5px 7px;
    border-radius: 3px;
    text-align: center;
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    font-weight: bold;
    -webkit-text-stroke: 0;
  }
  &.show-tooltip {
    opacity: 1;
    transition-delay: 0.2s;
    visibility: visible;
    display:block;
  }
}


</style>
