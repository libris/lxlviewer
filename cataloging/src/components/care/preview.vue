<script>
import EntityForm from '@/components/inspector/entity-form.vue';
import { mapGetters } from 'vuex';
import {isEmpty} from 'lodash-es';
import ItemEntity from "@/components/inspector/item-entity.vue";
import EntitySummary from "@/components/shared/entity-summary.vue";
import {translatePhrase} from "@/utils/filters.js";
import * as StringUtil from "../../../../lxljs/string.js";
import { Status, Type } from "@/utils/bulk.js";

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
    totalItems: {
      type: Number,
      default: 0,
    },
    offset: {
      type: Number,
      default: 0,
    },
    finished: {
      type: Boolean,
      default: false,
    },
    hasUnsaved: {
      type: Boolean,
      default: false,
    },
    specType: {
      type: String,
      default: '',
    }
  },
  computed: {
    ...mapGetters([
      'inspector',
      'user',
      'resources'
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
    },
    noHitsLabel() {
      if (this.hasUnsaved)  {
        return translatePhrase('Save bulk change to preview');
      } else if (this.totalItems !== 0 ) {
        return `${this.offset + 1} ${translatePhrase('of')} ${this.totalItems}`
      } else if (this.totalItems === 0) {
        return translatePhrase('No matching records');
      }
    },
    deleteSpecLabel() {
      return translatePhrase('Delete record');
    },
    completedLabel() {
      return StringUtil.getLabelByLang(Status.Completed, this.user.settings.language, this.resources)
    },
    isDeleteSpec() {
      return this.specType === Type.Delete;
    },
    isUpdateSpec() {
      return this.specType === Type.Update;
    },
    isMergeSpec() {
      return this.specType === Type.Merge;
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
      <span class="Preview-affected Breadcrumb-recordNumbers">{{ this.noHitsLabel }} </span>
      <div class="Preview-preview" v-if="showPreview">
        <div class="Preview-preview-heading">
          <entity-summary
            :focus-data="previewData"
            :should-link="false"
            :exclude-components="['details']"/>
        </div>
        <entity-form v-if="isUpdateSpec"
          :editing-object="'mainEntity'"
          :key="formTab.id"
          :is-active="true"
          :diff="previewDiff"
          :form-data="previewData"
          :locked="true"
        />
        <entity-form v-if="isDeleteSpec || isMergeSpec"
          :editing-object="'mainEntity'"
          :key="formTab.id"
          :is-active="true"
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
      padding-top: 5px;
      margin-top: 10px;
      border-bottom: solid 1px @grey-lighter;
      border-top: solid 1px @grey-lighter;
      margin-bottom: 20px;
    }
  }

  &-affected {
    padding-left: 12px;
  }

  &-completed {
    display: flex;
    padding-left: 12px;
  }

}
</style>
