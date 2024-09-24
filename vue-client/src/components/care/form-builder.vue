<script>
import EntityForm from '@/components/inspector/entity-form.vue';
import FieldAdder from '@/components/inspector/field-adder.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'form-builder.vue',
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
    isActive: {
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
  <div class="FormBuilder">
    <div
      class="FormBuilder-label uppercaseHeading"
      :class="{ 'has-selection': isActive }">
      {{ this.title }}
    </div>
    <div class="FormBuilder-body" :class="{ 'has-selection': isActive }">
      <div>
        <entity-form
          :editing-object="'mainEntity'"
          :key="formTab.id"
          :is-active="true"
          :form-data="formData"
          :locked="!isActive"
          :in-bulk-change-view="true"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.FormBuilder {
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
      //background-color: #D9EBDC;
      //background-color: @brand-faded;
      border-color: @brand-faded;
      border-width: 5px;
    }
  }

}
</style>
