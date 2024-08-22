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
    };
  },
  props: {
    formData: {
      type: Object,
      default: () => ({}),
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
  emits: ['updateForm'],
  methods: {
    setForm() {
      this.$emit('updateForm', this.formObj);
    },
  },
};
</script>
<template>
  <div class="FormBuilder">
    <div
      class="FormBuilder-label uppercaseHeading"
      :class="{ 'has-selection': selected }">
      formbyggaren
    </div>
    <div class="FormBuilder-body" :class="{ 'has-selection': selected }">
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
        class="FieldAdder-add btn btn-default toolbar-button"
        v-on:click="setForm()"
        @keyup.enter="setForm()">
        <span>Lägg till i form</span>
      </button>
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
      background-color: #D9EBDC;
      //background-color: @brand-faded;
    }
  }

  &-body {
    height: 100%;
    background-color: @white;
    border: 1px solid @grey-lighter;
    padding:  20px;
    transition: background-color 0.3s ease;

    &.has-selection {
      background-color: #D9EBDC;
      border-color: transparent;
    }
  }

}
</style>
