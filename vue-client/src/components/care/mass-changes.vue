<!--
Questions:
Q: Where should the "runs"/"run specifications" be stored?
A: They should be grouped by sigel. ...
Q:

-->
<script>
import EntityForm from '@/components/inspector/entity-form.vue';
import FieldAdder from '@/components/inspector/field-adder.vue';
import FormMixin from '@/components/mixins/form-mixin.vue';
import { mapGetters } from 'vuex';
import emptyTemplate from './templates/empty.json';

export default {
  name: 'mass-changes.vue',
  mixins: [FormMixin],
  components: { FieldAdder, EntityForm },
  data() {
    return {
      showOverview: true,
      formData: {
        '@type': 'Instance',
        label: 'test',
      },
      runSpecifications: [],
      currentSpec: {},
      showSpec: false,
    };
  },
  computed: {
    ...mapGetters([
      'inspector',
    ]),
    formTab() {
      return { id: 'form', text: 'test' };
    },
    formObj() {
      console.log('updated formdata', JSON.stringify(this.inspector.data.mainEntity));
      return this.inspector.data.mainEntity;
    },
  },
  methods: {
    initRunSpecification(caseName) {
      const runSpec = emptyTemplate.runTemplate;
      // create a name (based on user input?)
      // default to caseName if from template. Demand the name to be unique and use it as identifier.
      runSpec.name = caseName;
      runSpec.date = this.getDateString();

      // TODO: Try to make operations edithistory in the standard entity form (entity-form.vue)
      // e.g. *delete* subject hästar, insert subject *åsnor*
      runSpec.operations = emptyTemplate.operationTemplate;

      if (!this.runSpecifications.some((run) => run.name === runSpec.name)) {
        this.runSpecifications.push(runSpec);
      }
      this.currentSpec = runSpec;
      this.showSpec = true;
    },
    getDateString() {
      const date = new Date();
      return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    },
    init() {
      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: 'mainEntity',
            value: this.formData,
          },
        ],
        addToHistory: true,
      });
      this.$store.dispatch('pushInspectorEvent', {
        name: 'record-control',
        value: 'start-edit',
      });
      this.initRunSpecification('Specifikationsnamn');
    },
    setFormForCurrentSpec() {
      this.currentSpec.form = this.formObj;
    },
    reset() {
      this.$store.dispatch('setInspectorStatusValue', {
        property: 'editing',
        value: false,
      });
    },
  },
  beforeMount() {
    this.init();
  },
  unmounted() {
    this.reset();
  },
};
</script>
<template>
  <div class="MassChanges">
    <div class="MassChanges-form">
      FORMBYGGAREN
      <div>
        <field-adder
          :entity-type="this.formData['@type']"
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
        v-on:click="setFormForCurrentSpec()"
        @keyup.enter="setFormForCurrentSpec()">
        <span>Lägg till i form</span>
      </button>

      <div>
        SPECIFICATION
        <pre>{{this.currentSpec}}</pre>
        ENTITY FORM
        <pre>{{this.formObj}}</pre>
        OPERATIONS
        <pre>{{this.currentSpec.operations}}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.MassChanges {
  &-recordSelection {
  }
  &-caseButton {
  }
}
</style>
