<script>
import EntityForm from '@/components/inspector/entity-form.vue';
import FieldAdder from '@/components/inspector/field-adder.vue';
import FormMixin from '@/components/mixins/form-mixin.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'form-builder.vue',
  mixins: [FormMixin],
  components: { FieldAdder, EntityForm },
  data() {
    return {
      selected: true,
      emptyOperations: {
        path: [],
        property: '',
        delete: {},
        insert: {},
      },
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
    operations() {
      // get a hold of history object here.
      const operations = this.emptyOperations;
      return operations;
    },
  },
  emits: ['updateOperations'],

  methods: {
    setOperations() {
      console.log('this.inspector.changeHistory', JSON.stringify(this.inspector.changeHistory));
      this.$emit('updateOperations', this.operations);
    },
  },
  watch: {
    isActive(newVal, oldVal) {
      if (newVal === true && newVal !== oldVal) {
        this.$store.dispatch('flushChangeHistory');
      }
    },
  },
};
</script>
<template>
  <div class="OperationsBuilder">
    <div
      class="OperationsBuilder-label uppercaseHeading"
      :class="{ 'has-selection': isActive }">
      operationsbyggaren
    </div>
    <div class="OperationsBuilder-body" :class="{ 'has-selection': isActive }">
      <div>
        <entity-form
          :editing-object="'mainEntity'"
          :key="formTab.id"
          :is-active="true"
          :form-data="this.formObj"
          :locked="false" />
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
        v-on:click="setOperations()"
        @keyup.enter="setOperations()">
        <span>Lägg till operationer</span>
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
