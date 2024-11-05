<script>
import EntityForm from '@/components/inspector/entity-form.vue';
import FieldAdder from '@/components/inspector/field-adder.vue';
import { mapGetters } from 'vuex';
import {convertResourceLink, translatePhrase} from "../../utils/filters.js";

export default {
  name: 'merge-spec.vue',
  components: {FieldAdder, EntityForm},
  data() {
    return {
      selected: true,
      showIdListLink: false,
    };
  },
  props: {
    title: '',
    formData: {
      type: Object,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    firstItemActive: {
      type: Boolean,
      default: false,
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
  computed: {
    ...mapGetters([
      'inspector',
    ]),
    formTab() {
      return { id: 'form', text: 'test' };
    },
  },
  emits: ['onInactive', 'onActive'],
  methods: {
    convertResourceLink,
    translatePhrase,
    onInactive() {
      this.$emit('onInactive');
    },
    onActive() {
      this.$emit('onActive');
    },
  },
};
</script>
<template>
  <div class="MergeSpec">
    <div
      class="MergeSpec-label uppercaseHeading"
      :class="{ 'has-selection': isActive }">
      {{ this.title }}
    </div>
    <div class="MergeSpec-body" :class="{ 'has-selection': isActive }">
      <div>
        <entity-form
          :editing-object="'mainEntity'"
          :key="formTab.id"
          :is-active="true"
          :form-data="formData"
          :locked="!isActive"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.MergeSpec {
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

  &-closeButton {
    padding-right: 20px;
  }

  &-body {
    height: 100%;
    background-color: @white;
    border: 1px solid @grey-lighter;
    padding:  20px;
    transition: background-color 0.3s ease;

    &.has-selection {
      //background-color: #D9EBDC;
      //background-color: @brand-faded;
      border-color: @brand-faded;
      border-width: 5px;
    }
  }

}
</style>
