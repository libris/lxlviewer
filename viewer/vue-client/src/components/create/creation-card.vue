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
      const tree = [this.creation].map(type => VocabUtil.getTree(type, this.resources.vocab, this.resources.context));
      return VocabUtil.flattenTree(tree, this.resources.vocab, this.resources.context, this.settings.language);
    },
  },
};
</script>

<template>
  <div class="CreationCard panel card" :class="{'is-active': isActive}">
    <div v-if="isBase" class="CreationCard-content card-content" @click="setIndex()">
      <div class="card-text">
        <h2 class="CreationCard-title card-title">{{'Baspost'}}</h2>
        <div class="CreationCard-descr card-descr">Innehåller de vanligaste fälten för vald typ.</div>
      </div>
      <div class="card-link">
        <select class="CreationCard-select customSelect" 
          @change="useBase($event)"
          aria-labelledby="CreationCard-selectLabel">
          <option id="CreationCard-selectLabel" class="CreationCard-option" selected disabled>
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
    </div>
    <div v-if="!isBase" class="CreationCard-content card-content">
      <div class="card-text">
        <h2 class="CreationCard-title card-title">{{template.label}}</h2>
        <div class="CreationCard-descr card-descr">{{template.description}}</div>
      </div>
      <div class="card-link">
        <button class="CreationCard-select btn btn-primary btn--md" tabindex="0" v-show="!isActive" @keyup.enter="useTemplate(template.value)" @click="useTemplate(template.value)">
          {{ 'Choose' | translatePhrase }}
        </button>
        <a class="CreationCard-select" tabindex="0" v-show="isActive" @keyup.enter="useTemplate(template.value)" @click="useTemplate(template.value)">
          {{ 'Chosen' | translatePhrase }}
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="less">

.CreationCard  {
  min-width: 250px;
  max-width: 250px;
  margin-right: 20px;

  @media screen and (max-width: @screen-xs-min){
    flex-basis: 100%;
    max-width: 100%;
  }

  &-title {
    width: 100%;
  }

  &-descr {
  }

  &-content {
    min-height: 200px;
    padding-bottom: 10px;
  }

  &-select {
    width: 100%;
  }

  &-option {
    background-color: @white;
    color: @black;
    border-top: none;
  }
}

</style>
