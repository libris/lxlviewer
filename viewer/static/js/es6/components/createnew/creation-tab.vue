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
@import '../shared/_variables.less';

.creation-tab {
  display: flex;
  padding-left: 1em;
  font-size: 1em;
  > div {
    color: @brand-primary;
    transition: background 0.2s ease;
    > label {
      padding: 0.4em 1em;
      width: 100%;
      text-align: center;
      text-transform: uppercase;
      margin: 0;
      cursor: pointer;
      > input {
        display: none;
      }
    }
    &:hover {
      > label {
        text-decoration: underline;
      }
    }
    &.active {
      color: @white;
      background: @brand-primary;
      &:hover {
        > label {
          text-decoration: none;
        }
      }
    }
  }
}
</style>
