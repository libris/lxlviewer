<script>
import EntityForm from '@/components/inspector/entity-form.vue';
import FieldAdder from '@/components/inspector/field-adder.vue';
import { mapGetters } from 'vuex';
import ReverseRelations from "../inspector/reverse-relations.vue";
import {translatePhrase} from "../../utils/filters.js";
import * as StringUtil from "../../../../lxljs/string.js";

export default {
  name: 'target-form-builder.vue',
  components: {ReverseRelations, FieldAdder, EntityForm },
  data() {
    return {
      selected: true,
    };
  },
  props: {
    title: '',
    isActive: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: null
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters([
      'inspector',
      'user',
      'resources'
    ]),
    completedLabel() {
      return StringUtil.getLabelByLang('CompletedBulkChange', this.user.settings.language, this.resources)
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
  <div class="Results">
    <div
      class="Results-label uppercaseHeading"
      :class="{ 'has-selection': isActive }">
      {{ this.title }}
    </div>
    <div class="Results-body" :class="{ 'has-selection': isActive }">
      <div class="Results-notCompleted" v-if="!completed">
        <div>{{ translatePhrase('Results are shown when bulk change has status')}} </div>
        <div>&nbsp<span class="badge badge-accent2">{{ completedLabel }}</span>.</div>
      </div>
      <div class="Results-padding" v-if="completed">
        <reverse-relations
          :main-entity="data"
          :compact="true"
          :force-load="true"/>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.Results {
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
    padding:  20px;
    transition: background-color 0.3s ease;

    &.has-selection {
      border-color: @brand-faded;
      border-width: 5px;
    }
  }

  &-notCompleted {
    display: flex;
    padding-left: 12px;
  }

  &-completed {
    padding-left: 12px;
  }
}
</style>
