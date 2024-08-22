<!--
Questions:
Q: Where should the "runs"/"run specifications" be stored?
A: They should be grouped by sigel. ...
Q:

-->
<script>
import FormBuilder from '@/components/care/form-builder.vue';
import { mapGetters } from 'vuex';
import emptyTemplate from './templates/empty.json';

export default {
  name: 'mass-changes.vue',
  components: { FormBuilder },
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
    dataObj() {
      // Try to keep shared between form builder and operations builder
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
      this.setDataObj(this.formData);
      this.$store.dispatch('pushInspectorEvent', {
        name: 'record-control',
        value: 'start-edit',
      });
      this.initRunSpecification('Specifikationsnamn');
    },
    setDataObj(formData) {
      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: 'mainEntity',
            value: formData,
          },
        ],
        addToHistory: true,
      });
    },
    setFormForCurrentSpec(obj) {
      this.currentSpec.form = obj;
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
      <form-builder
        :form-data="this.dataObj"
        @updateForm="setFormForCurrentSpec"
      />
      OPERATIONSBYGGAREN
      <div>
        SPECIFICATION
        <pre>{{this.currentSpec}}</pre>
        ENTITY FORM
        <pre>{{ this.dataObj }}</pre>
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
