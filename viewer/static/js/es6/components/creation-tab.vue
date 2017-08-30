<script>
export default {
  name: 'creation-tab',
  props: {
    creationList: [],
  },
  data() {
    return {
      selectedCreation: 'Instance',
    }
  },
  methods: {
    isActive(creation) {
      return this.selectedCreation === creation;
    }
  },
  computed: {
  },
  components: {
  },
  watch: {
    selectedCreation(newVal) {
      this.$dispatch('set-creation', newVal);
    },
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div class="creation-tab">
    <div v-for="creation in creationList" :class="{'active': isActive(creation)}">
      <label>
        <input type="radio" v-model="selectedCreation" :value="creation"></input>
        {{creation | labelByLang}}
      </label  
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.creation-tab {
  display: flex;
  padding-left: 0.5em;
  font-size: 1em;
  > div {
    padding: 0 0.5em;
    color: @gray-light;
    &.active {
      color: @brand-primary;
      > label {
        text-decoration: underline;
      }
    }
    > label {
      cursor: pointer;
      width: 100%;
      text-align: center;
      text-transform: uppercase;
      > input {
        display: none;
      }
    }
  }
}
</style>
