
<script>
export default {
  name: 'creation-tab',
  data () {
    return {
      selectedCreation: 'Instance',
    }
  },
  props: {
    creationList: Array,
  },
  methods: {
    isActive(creation) {
      return this.selectedCreation === creation;
    }
  },
  watch: {
    selectedCreation(newVal) {
      this.$emit('set-creation', newVal);
    },
  },
};
</script>

<template>
  <div class="creation-tab">
    <div v-for="creation in creationList" :key="creation" :class="{'active': isActive(creation)}">
      <label>
        <input type="radio" v-model="selectedCreation" :value="creation">
        {{creation | labelByLang}}
      </label>
    </div>
  </div>
</template>

<style lang="less">
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
