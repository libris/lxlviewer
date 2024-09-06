<script>
import EntityForm from '@/components/inspector/entity-form.vue';
import FieldAdder from '@/components/inspector/field-adder.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'operations-builder.vue',
  components: { FieldAdder, EntityForm },
  data() {
    return {
      selected: true,
      diff: {
        added: [],
        removed: [],
        modified: [],
      },
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
  },
  computed: {
    ...mapGetters([
      'inspector',
    ]),
    formTab() {
      return { id: 'form', text: 'test' };
    },
    formObj() {
      return this.formData;
    },
  },
  emits: ['onInactive', 'onActive'],
  methods: {
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
  <div class="OperationsBuilder">
    <div
      class="OperationsBuilder-label uppercaseHeading"
      :class="{ 'has-selection': isActive }">
      {{ this.title }}
    </div>
    <div class="OperationsBuilder-body" :class="{ 'has-selection': isActive }">
      <div>
        <entity-form
          :editing-object="'mainEntity'"
          :key="formTab.id"
          :is-active="true"
          :form-data="this.formObj"
          :locked="false"
        />
      </div>
      <div
        class="OperationsBuilder-preview">
        <div class="OperationsBuilder-preview heading uppercaseHeading">
          Förhandsgranskning
        </div>
        <entity-form
          :editing-object="'mainEntity'"
          :key="formTab.id"
          :is-active="true"
          :diff="this.diff"
          :form-data="this.formObj"
          :locked="true"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.OperationsBuilder {
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
      border-width: 3px;
    }
  }

  &-preview {
    padding-top: 20px;
    &.heading {
      padding-bottom: 10px;
    }
  }

}
</style>
