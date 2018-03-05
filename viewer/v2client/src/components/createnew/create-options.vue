
<script>
export default {
  name: 'create-options',
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
  <div class="Create-options" role="tablist" aria-label="Categories">
    <div class="Create-option" role="tab" aria-controls="creationCardPanel"
      v-for="creation in creationList" 
      :key="creation" 
      :class="{'is-active': isActive(creation)}"
      :aria-selected="isActive(creation)">
      <label class="Create-optionName" :for="creation.toLowerCase()+'Option'">
        <input class="Create-optionInput" type="radio" :id="creation.toLowerCase()+'Option'"
          :name="creation.toLowerCase()+'Option'"
          v-model="selectedCreation" 
          :value="creation">
          {{creation | labelByLang}}
      </label>
    </div>
  </div>
</template>

<style lang="less">

.Create {
  &-options {
    display: flex;
    font-size: 16px;
    font-size: 1.6rem;
  }

  &-option {
    color: @brand-primary;
    transition: background 0.2s ease;

    &:hover {
      text-decoration: underline;
    }

    &.is-active {
      color: @white;
      background: @brand-primary;
      
      &:hover {
        text-decoration: none;
      }  
    }
  }

  &-optionName {
    cursor: pointer;
    padding: 0.4em 1em;
    width: 100%;
    text-align: center;
    text-transform: uppercase;
    margin: 0;  

    &:hover {
      text-decoration: underline;
    }
  }

  &-optionInput {
    display: none;  
  }
}
</style>
