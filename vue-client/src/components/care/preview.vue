<script>
import EntityForm from '@/components/inspector/entity-form.vue';
import { mapGetters } from 'vuex';
import {isEmpty} from 'lodash-es';
import ItemEntity from "@/components/inspector/item-entity.vue";
import EntitySummary from "@/components/shared/entity-summary.vue";
import {asFnurgelLink} from "@/utils/filters.js";

export default {
  name: 'preview',
  components: {EntitySummary, ItemEntity, EntityForm },
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
    }
  },
  emits: ['onInactive', 'onActive'],
  methods: {
    onInactive() {
      this.$emit('onInactive');
    },
    onActive() {
      this.$emit('onActive');
    },
    prev() {
      this.$emit('prevPreviewItem');
    },
    next() {
      this.$emit('nextPreviewItem');
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
  <div class="Preview">
    <div
      class="Preview-label uppercaseHeading"
      :class="{ 'has-selection': isActive }">
      {{ this.title }}
    </div>
    <div class="Preview-body" :class="{ 'has-selection': isActive }">
      <div class="Preview-preview" v-if="hasPreviewData">
        <div class="Preview-preview-heading">
        <entity-summary
          :focus-data="previewData"
          :should-link="false"
          :exclude-components="['details']" />
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
.Preview {
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

  &-body {
    height: 100%;
    background-color: @white;
    border: 1px solid @grey-lighter;
    padding: 20px;
    transition: background-color 0.3s ease;

    &.has-selection {
      border-color: @brand-faded;
      border-width: 5px;
    }
  }

  &-preview {
    padding-bottom: 10px;
    &-heading {
      border-bottom: solid 2px @grey-lighter;
      margin-bottom: 20px;
    }
  }

}
</style>
