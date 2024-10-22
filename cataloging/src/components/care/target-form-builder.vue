<script>
import EntityForm from '@/components/inspector/entity-form.vue';
import FieldAdder from '@/components/inspector/field-adder.vue';
import { mapGetters } from 'vuex';
import {isEmpty} from 'lodash-es';
import {translatePhrase} from "../../utils/filters.js";

export default {
  name: 'target-form-builder.vue',
  components: { FieldAdder, EntityForm },
  data() {
    return {
      selected: true,
    };
  },
  props: {
    title: '',
    formData: {
      type: Object,
      default: () => ({}),
    },
    previewData: {
      type: Object,
      default: () => ({}),
    },
    previewDiff: {
      type: Object,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    hasUnsaved: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
    ]),
    formTab() {
      return { id: 'form', text: 'test' };
    },
    data() {
      return this.formData;
    },
    hasPreviewData() {
      return !isEmpty(this.previewData) && !isEmpty(this.previewDiff);
    },
    showPreview() {
      return this.hasPreviewData && !this.hasUnsaved;
    }
  },
  emits: ['onInactive', 'onActive'],
  methods: {
    translatePhrase,
    onInactive() {
      this.$emit('onInactive');
    },
    onActive() {
      this.$emit('onActive');
    },
  },
  watch: {
    isActive(newValue, oldValue) {
      if (newValue !== oldValue && oldValue) { // active -> inactive
        this.onInactive();
      } else if (newValue !== oldValue && newValue) { // inactive -> active
        this.onActive();
      }
    }
  },
};
</script>
<template>
  <div class="TargetFormBuilder">
    <div
      class="TargetFormBuilder-label uppercaseHeading"
      :class="{ 'has-selection': isActive }">
      {{ this.title }}
    </div>
    <div class="TargetFormBuilder-body" :class="{ 'has-selection': isActive }">
      <div v-if="isDraft">
        <entity-form
          :editing-object="'mainEntity'"
          :key="formTab.id"
          :is-active="true"
          :form-data="data"
          :locked="!isActive"
        />
      </div>
      <div
        v-if="showPreview" v-bind:class="{'TargetFormBuilder-gap': isDraft}">
      <div class="TargetFormBuilder-idLabel" v-if="isDraft">
        {{ translatePhrase('Preview ')}}
      </div>
        <entity-form
          :editing-object="'mainEntity'"
          :key="formTab.id"
          :is-active="true"
          :diff="previewDiff"
          :form-data="previewData"
          :locked="true"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.TargetFormBuilder {
  margin-top: 20px;
  &-label {
    padding: 5px 10px;
    background-color: @grey-lighter;
    display: table; // ie fallback
    width: fit-content;
    transition: background-color 0.3s ease;

    &.has-selection {
      background-color: @brand-faded;
      color: @black;
    }
  }

  &-idLabel {
    width: fit-content;
    font-size: 12px;
    padding-bottom: 4px;
  }

  &-body {
    height: 100%;
    background-color: @white;
    border: 1px solid @grey-lighter;
    padding:  20px;
    transition: background-color 0.3s ease;

    &.has-selection {
      border-color: @brand-faded;
      border-width: 5px;
    }
  }

  &-gap {
    padding-top: 20px;
  }

}
</style>
