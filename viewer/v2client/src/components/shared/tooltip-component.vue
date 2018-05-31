<script>
import * as StringUtil from '../../utils/string';

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
  },
  ready() {
  },
  methods: {
  },
};
</script>

<template>
  <div class="tooltip-container-outer" :class="{ 'show-tooltip': compShowTooltip }" @mouseover="hoverTooltip = true" @mouseleave="hoverTooltip = false">
    <div class="tooltip-container-inner" >
      {{translatedText | capitalize}}
    </div>
  </div>
</template>

<style lang="less">

.tooltip-container-outer {
  position: absolute;
  visibility: hidden;
  opacity: 0;
  transform: translate(-50%, -50px);
  transition: all 0.1s ease;
  display: none;

  .tooltip-container-inner {
    background-color: @black;
    white-space: nowrap;
    color: @white;
    padding: 5px 7px;
    border-radius: 3px;
    text-align: center;
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    font-weight: bold;
    -webkit-text-stroke: 0;
  }
  &::after {
    left: 50%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-color: rgba(136, 183, 213, 0);
    border-top-color: @black;
    border-width: 6px;
    margin-left: 3px;
  }
  &.show-tooltip {
    opacity: 1;
    transition-delay: 0.2s;
    visibility: visible;
    display:block;
  }
}


</style>
