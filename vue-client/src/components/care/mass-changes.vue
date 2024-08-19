<!--
Questions:
Q: Where should the "runs"/"run specifications" be stored?
A: They should be grouped by sigel. ...
Q:

-->
<script>
import EntityForm from '@/components/inspector/entity-form.vue';
import templates from './templates/cases.json';
import emptyTemplate from './templates/empty.json';
import FieldAdder from "@/components/inspector/field-adder.vue";

export default {
  name: 'mass-changes.vue',
  components: {FieldAdder, EntityForm },
  data() {
    return {
      showOverview: true,
      runSpecifications: [],
      showSpec: false,
    };
  },
  computed: {
    caseNames() {
      return templates.cases.map((c) => c.name);
    },
    formTab() {
      return { id: 'form', text: 'test' };
    },
    formData() {
      return {
        '@type': 'Instance',
        responsibilityStatement: 'Maria Gripe ; med ill. av Harald Gripe',
      };
    },
  },
  methods: {
    createRunSpecification(caseName) {
      this.editing();
      const templateCase = templates.cases.find((c) => c.name === caseName);
      const runSpec = emptyTemplate.runTemplate;
      // create a name (based on user input?)
      // default to caseName if from template. Demand the name to be unique and use it as identifier.
      runSpec.name = caseName;
      runSpec.date = this.getDateString();

      // Form should be taken from (1) a template (2) a form created from cat tool
      // If template:
      runSpec.form = templateCase ? templateCase.form : {};

      // This will be a STEP in the final implementation, for now it can be taken from a template

      // TODO: Try to make operations edithistory in the standard entity form (entity-form.vue)
      // e.g. *delete* subject hästar, insert subject *åsnor*
      runSpec.operations = templateCase ? templateCase.operations : emptyTemplate.operationTemplate;

      if (!this.runSpecifications.some((run) => run.name === runSpec.name)) {
        this.runSpecifications.push(runSpec);
      }
      this.showSpec = !this.showSpec;
    },
    getDateString() {
      const date = new Date();
      return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    },
    editing() {
      this.$store.dispatch('pushInspectorEvent', {
        name: 'record-control',
        value: 'start-edit',
      });
    },
    stopEditing() {
      this.$store.dispatch('setInspectorStatusValue', {
        property: 'editing',
        value: false,
      });
    },
  },
  unmounted() {
    this.stopEditing();
  },
};
</script>
<template>
  <div class="MassChanges">
    <div class="MassChanges-form">
      <div v-for="name in caseNames">
        <button
          class="btn btn--md MassChanges-caseButton"
          @click.prevent="createRunSpecification(name)">
          <span> {{name}} </span>
        </button>
        <div>
          <field-adder
            class="FieldAdder--inToolbar Toolbar-btn"
            v-if="inspector.status.editing"
            :entity-type="inspector.data[inspector.status.focus]['@type']"
            :inner="false"
            :allowed="allowedProperties"
            :path="inspector.status.focus"
            :editing-object="inspector.status.focus"
          />

          <entity-form
            :editing-object="formTab.id"
            :key="formTab.id"
            :is-active="true"
            :form-data="formData"
            :locked="false" />
        </div>
        <div v-if="showSpec">
          <!-- SHOW PREVIEW. When prototyping this can be the end result (before backend is in place) -->
          <pre>{{runSpecifications[0]}}
          </pre>
        </div>
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
