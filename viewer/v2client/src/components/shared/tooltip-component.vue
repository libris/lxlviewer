<script>
import * as StringUtil from '../../utils/string';
import { getVocabulary, getSettings, getContext } from '../../vuex/getters';

export default {
  data() {
    return {
    };
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
      context: getContext
    },
    actions: {
    },
  },
  props: {
    tooltipText: '',
    translation: '',
    showTooltip: false,
    hoverTooltip: false,
  },
  components: {
  },
  watch: {
  },
  computed: {
    compShowTooltip() {
      return !this.hoverTooltip && this.showTooltip;
    },
    translatedText() {
      if (this.translation === 'labelByLang') {
        return StringUtil.getLabelByLang(this.tooltipText, this.settings.language, this.vocab, this.settings.vocabPfx, this.context);
      } else if (this.translation === 'translatePhrase') {
        return StringUtil.getUiPhraseByLang(this.tooltipText, this.settings.language);
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
  transform: translate(-50%, -50px);
  visibility: hidden;
  opacity: 0;
  transition: all 0.1s ease;
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
  }
}


</style>
