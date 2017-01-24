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
  },
  components: {
  },
  watch: {
  },
  computed: {
  },
  ready() {
  },
  methods: {
  },
};
</script>

<template>
  <div class="tooltip-container-outer">
    <div class="tooltip-container-inner">
      Lägg till {{ tooltiptext | labelByLang }}
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.tooltip-container-outer {
  position: absolute;
  padding-left: 18px;
  transform: translate(-50%, -210%);
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
}


</style>
