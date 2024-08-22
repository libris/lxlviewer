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
  <div class="ForBuilder">
    <div class="MassChanges-form">
      <div>
        <field-adder
          :entity-type="this.formObj['@type']"
          :inner="false"
          :allowed="allowedProperties"
          :path="'mainEntity'"
          :editing-object="'mainEntity'"
        />
        <entity-form
          :editing-object="'mainEntity'"
          :key="formTab.id"
          :is-active="true"
          :form-data="this.formObj"
          :locked="false" />
      </div>
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
}
</style>
