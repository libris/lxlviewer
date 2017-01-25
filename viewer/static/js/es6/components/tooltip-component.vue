<script>

export default {
  data() {
    return {
    };
  },
  vuex: {
    getters: {
    },
    actions: {
    },
  },
  props: {
    tooltiptext: '',
    showTooltip: false,
  },
  components: {
  },
  watch: {
  },
  computed: {
    compShowTooltip() {
      return this.showTooltip;
    },
  },
  ready() {
  },
  methods: {
  },
};
</script>

<template>
  <div class="tooltip-container-outer" :class="{ 'show-tooltip': compShowTooltip }">
    <div class="tooltip-container-inner" >
      Lägg till {{ tooltiptext | labelByLang }}
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.tooltip-container-outer {
  position: absolute;
  padding-left: 18px;
  transform: translate(-50%, -100%) scale(0.1);
  visibility: hidden;
  opacity: 0;
  transition: all 0.2s ease;
  transition-delay: 0s;
  .tooltip-container-inner { 
    background-color: @brand-primary;
    color: #fff;
    padding: 0px 5px;
    border-radius: 3px;
    text-align: center;

  }
  &::after {
    top: 98%;
    left: 50%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-color: rgba(136, 183, 213, 0);
    border-top-color: @brand-primary;
    border-width: 6px;
    margin-left: 3px;
  }
  &.show-tooltip {
    opacity: 1;
    transform: translate(-50%, -210%) scale(1);
    transition-delay: 0.5s;
    visibility: visible;
  }
}


</style>
