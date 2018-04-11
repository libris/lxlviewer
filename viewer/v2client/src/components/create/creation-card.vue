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
  <div class="CreationCard" :class="{'is-active': isActive}">
    <div class="CreationCard-wrap">
      <div v-if="isBase" class="CreationCard-content" @click="setIndex()">
        <h2 class="CreationCard-title">{{'Baspost'}}</h2>
          <div class="CreationCard-descr">Innehåller de vanligaste fälten för vald typ.</div>
          <select class="CreationCard-select" @change="useBase($event)" @keyup.enter="useBase($event)">
            <option class="CreationCard-option" selected disabled>
              {{'Choose type' | translatePhrase}}
            </option>
            <option class="CreationCard-option"
              v-for="(term, index) in getClassTree" 
              :value="term.id" 
              :key="index" 
              v-html="getFormattedSelectOption(term, settings, resources.vocab, resources.context)">
            </option>
          </select>
      </div>
      <div v-if="!isBase" class="CreationCard-content" 
        @click="useTemplate(template.value)">
        <h2 class="CreationCard-title">{{template.label}}</h2>
        <div class="CreationCard-descr">{{template.description}}</div>
        <button class="CreationCard-select" v-show="!isActive" @keyup.enter="useTemplate(template.value)">{{ 'Choose' | translatePhrase }}</button>
        <button class="CreationCard-select" v-show="isActive" @keyup.enter="useTemplate(template.value)">{{ 'Chosen' | translatePhrase }}</button>
      </div>
    </div>
  </div>
</template>

<style lang="less">

.CreationCard  {
  flex: 1 1 33%;
  max-width: 33.34%;
  border: 1em solid transparent;  
  
  &-title {
    font-size: 20px;
    font-size: 2.0rem;
    font-weight: 500;
    margin: 5px 0;
  }

  &-descr {
    font-size: 16px;
    font-size: 1.6rem;
    margin-bottom: 0.1em;
    flex-grow: 1;
  }

  &-wrap {
    height: 100%;
  }

  &-content {
    height: 100%;
    border: 1px solid @gray-lighter;
    padding: 0.5em;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    cursor: pointer;

    .CreationCard:hover & {
      outline: 2px dashed fadeout(@brand-primary, 70%);
    }

    .is-active & {
      outline: 3px solid @brand-primary;
    }
  }

  &-select {
    color: @black;
    border:none;
    border-radius: 2px;
    background-color: @gray-lighter;
    padding: 0.4em;
    font-weight:bold;
    height: 2.4em;

    &:focus {
      outline: 2px dashed fadeout(@brand-primary, 70%);
      background-color: lighten(@brand-primary, 5%);
      color: @white;
    }

    .is-active & {
      color: @white;
      background-color: lighten(@brand-primary, 5%);
    }

    .CreationCard:hover & {
      color: @white;
      background-color: lighten(@brand-primary, 5%);
    }
  }

  &-option {
    background-color: @white;
    color: @black;
    border-top: none;
  }
}

</style>
