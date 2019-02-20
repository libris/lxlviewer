<script>
import { mapGetters } from 'vuex';
import EntitySummary from '@/components/shared/entity-summary';
import VueSimpleSpinner from 'vue-simple-spinner';

export default {
  name: 'post-picker',
  props: {
    name: {
      type: String,
      required: true,
    },
    fetchedItems: {
      type: Array,
      required: true,
    },
    fetchComplete: {
      type: Boolean,
    },
    info: {
      type: String,
      default: '',
    },
  },
  components: {
    'entity-summary': EntitySummary,
    'vue-simple-spinner': VueSimpleSpinner,
  },
  data() {
    return {
      expanded: false,
      selected: null,
    };
  },
  computed: {
    ...mapGetters([
      'directoryCare',
    ]),
  },
  methods: {
    selectThis(item) {
      this.selected = item;
      const changeObj = { [this.name]: item['@id'] };
      this.$store.dispatch('setDirectoryCare', { ...this.directoryCare, ...changeObj });
    },
    unselectThis() {
      this.selected = null;
      const changeObj = { [this.name]: null };
      this.$store.dispatch('setDirectoryCare', { ...this.directoryCare, ...changeObj });
    },
  },
  mounted() {
  },

};
</script>

<template>
  <div class="PostPicker">
    <div class="PostPicker-label uppercaseHeading">{{ name | translatePhrase }}</div>
    <div class="PostPicker-body">
      <div class="PostPicker-dropdownContainer" v-if="!selected">
        <div class="PostPicker-toggle" @click="expanded = !expanded">
          <span class="PostPicker-toggleLabel">{{ ['Choose', name] | translatePhrase }}</span>
          <span class="PostPicker-toggleIcon" :class="{ 'expanded' : expanded}">
            <i class="fa fa-fw fa-chevron-down"></i>
          </span>
        </div>
        <div class="PostPicker-dropdown" v-if="expanded">
          <vue-simple-spinner 
            v-if="!fetchComplete" 
            size="large" 
            :message="'Loading' | translatePhrase"></vue-simple-spinner>
          <input
            v-if="fetchComplete"
            type="text" 
            class="PostPicker-input" 
            autofocus 
            :placeholder="'Filter' | translatePhrase">
          <div class="PostPicker-itemWrapper"
            :key="item['@id']"
            v-for="item in fetchedItems"
            @click="selectThis(item)">
            <entity-summary 
              :focus-data="item" 
              :should-link="false"
              :valueDisplayLimit=1></entity-summary>
          </div>
        </div>
      </div>
      <div class="PostPicker-selectedContainer" v-if="selected">
        <span class="PostPicker-toggleLabel">{{ ['Chosen', name] | translatePhrase }}:</span>
        <entity-summary 
          :focus-data="selected" 
          :should-link="false"
          :valueDisplayLimit=1></entity-summary>
        <div>
          <button @click="unselectThis">x</button>
        </div>
      </div>
      <p v-if="info">{{info}}</p>
    </div>
  </div>
</template>

<style lang="less">

.PostPicker  {
  max-width: 50%;
  flex: 1;

  &-label {
    padding: 5px 10px;
    background-color: @gray-lighter;
    display: inline-block;
  }

  &-body {
    background-color: @white;
    border: 1px solid @grey-lighter;
    padding: 20px;
  }

  &-dropdownContainer,
  &-selectedContainer {
    border: 1px solid @gray-lighter;
    box-shadow: @shadow-panel;
    padding: 10px 15px;
    margin-bottom: 10px;
  }

  &-toggle {

    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }

  &-toggleLabel {
    color: @brand-darker;
    font-weight: 600;
  }

  &-toggleIcon {
    font-size: 14px;
    font-size: 1.4rem;
    transition: transform 0.2s ease;

    &.expanded {
      transform: rotate(180deg);
    }
  }

  &-dropdown {
    margin-top: 10px;
  }

  &-input {
    width: 100%;
    border: 1px solid @grey-lighter;
    border-radius: 4px;
    padding: 5px 10px;
    margin-bottom: 10px;
  }

  &-itemWrapper {
    cursor: pointer;
    border-top: 1px solid @grey-lighter;

    &:first-of-type {
      border-top: none;
    }

    &:hover {
      background-color: rgba(0, 128, 127, 0.1);
    }
  }

  & .EntitySummary {
    padding: 15px 5px;
  }

  & .EntitySummary-title {
    color: @brand-darker;
    font-size: 18px;
    font-size: 1.8rem;
  }
}

</style>
