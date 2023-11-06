<script>
import * as VocabUtil from 'lxljs/vocab';
import * as DisplayUtil from 'lxljs/display';
import { translatePhrase } from '@/utils/filters';

export default {
  name: 'creation-card',
  props: {
    creation: String,
    template: Object,
    isBase: Boolean,
    isAllowed: [Boolean, Object],
    index: Number,
    activeIndex: Number,
  },
  emits: ['use-base', 'use-template', 'set-active-index'],
  methods: {
    translatePhrase,
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
    getLabelWithTreeDepth(term, settings, resources) {
      return DisplayUtil.getLabelWithTreeDepth(term, settings, resources);
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
      const tree = [this.creation].map((type) => VocabUtil.getTree(type, this.resources.vocab, this.resources.context));
      return VocabUtil.flattenTree(tree, this.resources.vocab, this.resources.context, this.settings.language);
    },
  },
};
</script>

<template>
  <div class="CreationCard panel card" :class="{ 'is-active': isActive, 'is-disabled': !isAllowed }">
    <div v-if="isBase" class="CreationCard-content card-content" @click="setIndex()">
      <div class="card-text">
        <h2 class="CreationCard-title card-title">{{'Baspost'}}</h2>
        <div class="CreationCard-descr card-descr">Innehåller de vanligaste fälten för vald typ.</div>
      </div>
      <div class="card-link">
        <select
          class="CreationCard-select customSelect"
          @change="useBase($event)"
          aria-labelledby="CreationCard-selectLabel">
          <option id="CreationCard-selectLabel" class="CreationCard-option" selected disabled>
            {{ translatePhrase('Choose type')}}
          </option>
          <option
            class="CreationCard-option"
            v-for="(term, index) in getClassTree"
            :value="term.id"
            :key="index"
            :disabled="term.abstract"
            v-html="getLabelWithTreeDepth(term, settings, resources.vocab, resources.context)" />
        </select>
      </div>
    </div>
    <div v-if="!isBase" class="CreationCard-content card-content">
      <div class="card-text">
        <h2 class="CreationCard-title card-title">{{template.label}}</h2>
        <div class="CreationCard-descr card-descr">{{template.description}}</div>
      </div>
      <div class="card-link">
        <button
          class="CreationCard-select btn btn-primary btn--md"
          tabindex="0"
          v-show="!isActive"
          :disabled="!isAllowed"
          @keyup.enter="useTemplate(template.value)"
          @click="useTemplate(template.value)">
          {{ translatePhrase('Choose') }}
        </button>
        <a
          class="CreationCard-select"
          tabindex="0"
          v-show="isActive"
          @keyup.enter="useTemplate(template.value)"
          @click="useTemplate(template.value)">
          {{ translatePhrase('Chosen') }}
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="less">

.CreationCard  {
  flex-basis: 100%;
  max-width: 27rem;

  @media screen and (min-width: @screen-sm-min){
    flex-basis: 49%;
    margin-right: 1%;
  }
  @media screen and (min-width: @screen-md-min){
    flex-basis: 24%;
  }

  &.is-disabled {
    cursor: not-allowed;
    background-color: #efeded;
    box-shadow: none;

    .btn {
      background-color: #d8d8d8;
    }
  }

  &-title {
    width: 100%;
  }

  &-content {
    min-height: 200px;
    padding-bottom: 10px;
  }

  &-select {
    width: 100%;
    font-size: 14px;
    font-size: 1.4rem;
  }

  &-option {
    background-color: @white;
    color: @black;
    border-top: none;
  }
}

</style>
