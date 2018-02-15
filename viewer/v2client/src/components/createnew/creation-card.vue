<script>
import * as VocabUtil from '@/utils/vocab';
import * as DisplayUtil from '@/utils/display';

export default {
  name: 'creation-card',
  props: {
    creation: String,
    template: Object,
    isBase: Boolean,
    index: Number,
    activeIndex: Number,
  },
  methods: {
    useBase(event) {
      this.$emit('use-base', event.target.value);
    },
    useTemplate(templateValue) {
      this.setIndex();
      this.$emit('use-template', templateValue);
    },
    setIndex() {
      this.$emit('set-active-index', this.index);
    },
    getFormattedSelectOption(term, settings, vocab, context) {
      return DisplayUtil.getFormattedSelectOption(term, settings, vocab, context);
    },
  },
  computed: {
    settings() {
      return this.$store.getters.settings;
    },
    resources() {
      return this.$store.getters.resources;
    },
    isActive() {
      return this.activeIndex === this.index;
    },
    getClassTree() {
      const tree = [this.creation].map(type => {
        return VocabUtil.getTree(type, this.resources.vocab, this.settings.vocabPfx, this.resources.context);
      });
      return VocabUtil.flattenTree(tree, this.resources.vocab, this.settings.vocabPfx, this.resources.context, this.settings.language);
    },
  },
};
</script>

<template>
  <div class="creation-container">
    <div class="creation-card-container" :class="{'active': isActive}">
      <div v-if="isBase" class="creation-card" @click="setIndex()">
        <div>{{'Baspost'}}</div>
        <div class="description">Innehåller de vanligaste fälten för vald typ.</div>
        <select class="creation-dropdown" @change="useBase($event)">
          <option selected disabled>{{'Choose type' | translatePhrase}}</option>
          <option v-for="(term, index) in getClassTree" :value="term.id" :key="index" v-html="getFormattedSelectOption(term, settings, resources.vocab, resources.context)"></option>
        </select>
      </div>
      <div v-if="!isBase" class="creation-card" @click="useTemplate(template.value)">
        <div>{{template.label}}</div>
        <div class="description">{{template.description}}</div>
        <button v-show="!isActive">{{ 'Choose' | translatePhrase }}</button>
        <button v-show="isActive">{{ 'Chosen' | translatePhrase }}</button>
      </div>
    </div>
  </div>
</template>

<style lang="less">
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
      outline: 2px dashed fadeout(@brand-primary, 70%);
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
