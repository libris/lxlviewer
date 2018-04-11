
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
    },
    setActive(creation) {
      this.selectedCreation = document.getElementById(creation.toLowerCase()+"Option").value;
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
      <label class="Create-optionName" tabindex="0"
        :for="creation.toLowerCase()+'Option'"
        @keyup.enter="setActive(creation)">
        <input class="Create-optionInput" type="radio"
          :id="creation.toLowerCase()+'Option'"
          :name="creation.toLowerCase()+'Option'"
          v-model="selectedCreation" 
          :value="creation">
          <span v-if="creation !== 'File'">{{creation | labelByLang}}</span>
          <span v-if="creation === 'File'">{{ 'From file' | translatePhrase}}</span>
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
    font-size: 20px;
    font-size: 2rem;
    padding: 5px 10px;
    width: 100%;
    text-align: center;
    text-transform: uppercase;
    margin: 0;  
    border: 1px solid #fff;

    &:hover {
      text-decoration: underline;
    }

    .is-active & {
      border: 1px solid @brand-primary;
    }

    &:focus {
      outline: 0px dashed @brand-primary;
      border: 1px dashed @brand-primary;
    }
  }

  &-optionInput {
    display: none;  
  }
}
</style>
