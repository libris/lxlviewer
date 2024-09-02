<!-- TODO: currently this component probably can be replaced with the form-component -->
<script>
import EntityForm from '@/components/inspector/entity-form.vue';
import FieldAdder from '@/components/inspector/field-adder.vue';
import FormMixin from '@/components/mixins/form-mixin.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'operations-builder.vue',
  mixins: [FormMixin],
  components: { FieldAdder, EntityForm },
  data() {
    return {
      selected: true,
    };
  },
  props: {
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
      ändringar
    </div>
    <div class="OperationsBuilder-body" :class="{ 'has-selection': isActive }">
      <div>
        <entity-form
          :editing-object="'mainEntity'"
          :key="formTab.id"
          :is-active="true"
          :form-data="this.formObj"
          :locked="false"
          :in-operations="true"
        />
      </div>
      <field-adder
        :entity-type="this.formObj['@type']"
        :inner="false"
        :allowed="allowedProperties"
        :path="'mainEntity'"
        :editing-object="'mainEntity'"
      />
      <button
        class="btn btn-default"
        v-on:click="onInactive()"
        @keyup.enter="onInactive()">
        <span>Lägg till ändringar</span>
      </button>
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
      background-color: #D9EBDC;
      background-color: @brand-faded;
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
      border-width: 3px;
    }
  }

}
</style>
