<script>
export default {
  name: 'creation-card',
  props: {
    materialList: [],
    template: {},
    isBase: false,
    index: 0,
    activeIndex: 0,
  },
  data() {
    return {
    }
  },
  methods: {
    useBase() {
      this.$dispatch('use-base', event.target.value);
    },
    useTemplate(templateValue) {
      this.setIndex();
      this.$dispatch('use-template', templateValue);
    },
    setIndex() {
      this.$dispatch('set-active-index', this.index);
    }
  },
  computed: {
    isActive() {
      return this.activeIndex === this.index;
    }
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
  <div class="creation-container">
    <div class="creation-card-container" :class="{'active': isActive}">
      <div v-if="isBase" class="creation-card" @click="setIndex()">
        <div>{{'Baspost'}}</div>
        <div class="description">Innehåller de vanligaste fälten för vald typ.</div>
        <select class="creation-dropdown" @change="useBase()">
          <option selected disabled>{{'Choose type' | translatePhrase}}</option>
          <option v-for="material in materialList" value="{{material}}">{{material | labelByLang}}</option>
        </select>
      </div>
      <div v-if="!isBase" class="creation-card" @click="useTemplate(template.value)">
        <div>{{template.label}}</div>
        <div class="description">{{template.description}}</div>
        <button>{{ 'Choose' | translatePhrase }}</button>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.creation-container {
  flex: 1 1 33%;
  padding: 1em;
  max-width: 33.34%;
  > .creation-card-container {
    height: 100%;
    .creation-card {
      > div {
        font-size: 1.3em;
      }
      .description {
        font-size: 0.9em;
        margin-bottom: 0.1em;
        flex-grow: 1;
      }
      height: 100%;
      border: 1px solid @gray-lighter;
      padding: 0.5em;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
      .creation-dropdown {
        height: 2.4em;
      }
      > button, select {
        color: @black;
        border:none;
        border-radius: 2px;
        background-color: @gray-lighter;
        padding: 0.4em;
        font-weight:bold;
        > option {
          background-color: @white;
          color: @black;
          border-top: none;
        }
        &:hover {
          background-color: lighten(@brand-primary, 5%);
          color: @white;
        }
      }
    }
    &:hover {
      outline: 2px dashed @brand-primary;
      button, select {
        color: @white;
        background-color: lighten(@brand-primary, 5%);
      }
    }
    &.active {
      outline: 3px solid @brand-primary;
      button, select {
        color: @white;
        background-color: lighten(@brand-primary, 5%);
      }
    }
  }
}

</style>
