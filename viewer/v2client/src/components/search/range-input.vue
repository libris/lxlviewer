<script>
export default {
  name: 'range-input',
  props: {
  },
  data() {
    return {
      min: 0,
      max: 3000,
      lowerLimit: 0,
      upperLimit: 3000,
      step: 1
    }
  },
  methods: {
  },
  computed: {
  },
  components: {
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div class="range-input">
    <div class="multi-range">
      <hr/>
      <input type="range" :min="min" :max="max" v-model="lowerLimit" :step="step"/>
      <input type="range" :min="min" :max="max" v-model="upperLimit" :step="step"/>
    </div>
    <div class="limit-input-container">
      <input class="limit-input" v-model="lowerLimit">
      -
      <input class="limit-input" v-model="upperLimit">
    </div>
  </div>
</template>

<style lang="less">

.range-input {
  .limit-input-container {
    display: flex;
    padding: 0;
    justify-content: space-around;
    > input {
      flex: 0 0 40%;
      width: 40%;
      text-align: center;
      min-width: 0; /* Firefox flex breaks without this */
    }
  }
  .multi-range, .multi-range * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }
  .multi-range { 
    position: relative;
    height: 28px;
    font-family: monospace;
    padding: 0;

    > hr {
      position: absolute;
      width: 100%;
      top: 43%;
    }

    > input[type=range] {
      position: absolute;
      bottom: 6px;
      left: 0;
      appearance: none;
      height: 0;
      outline: none;
      overflow:visible;

      &::-webkit-slider-thumb {
        transform: translateY(-18px);
        -webkit-appearance: none;
        border: 1px solid #000000;
        border-radius: 100%;
        height: 16px;
        width: 16px;
        background: #ffffff;
        cursor: pointer;
      }

      &::-webkit-slider-runnable-track {
        -webkit-appearance: none;
        height: 0px;
      }

      &::-moz-range-thumb {
        transform: translateY(-9px);
        -moz-appearance: none;
        border: 1px solid #000000;
        border-radius: 100%;
        height: 16px;
        width: 16px;
        background: #ffffff;
        cursor: pointer;
      }

      &::-moz-range-track {
        -moz-appearance: none;
        height: 0px;
        display: none;
      }

      &::-ms-thumb {
        transform: translateY(-9px);
        box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
        border: 1px solid #000000;
        height: 36px;
        width: 16px;
        border-radius: 3px;
        background: #ffffff;
        cursor: pointer;
      }

      &::-ms-track {
        height: 30px;
        width: 100%;
      }
    }
  }
}
</style>
