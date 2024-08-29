<!--
Questions:
Q: Where should the "runs"/"run specifications" be stored?
A: They should be grouped by sigel. ...
Q:

-->
<script>
import FormBuilder from '@/components/care/form-builder.vue';
import OperationsBuilder from '@/components/care/operations-builder.vue';
import { mapGetters } from 'vuex';
import { isEmpty } from 'lodash-es';
import emptyTemplate from './templates/empty.json';
import setData from "lodash-es/_setData.js";

export default {
  name: 'mass-changes.vue',
  components: { FormBuilder, OperationsBuilder },
  data() {
    return {
      showOverview: true,
      initialData: {
        '@type': 'Instance',
        label: 'test',
      },
      activeStep: '',
      runSpecifications: [],
      currentSpec: {},
      formObject: {
        '@type': 'Instance',
        label: 'test',
      },
      opsObject: {
        '@type': 'Instance',
        label: 'test',
      },
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
      this.setDataObj(this.initialData);
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
    onInactiveForm() {
      this.currentSpec.beforeForm = this.dataObj;
      this.formObject = this.currentSpec.beforeForm;
    },
    onActiveForm() {
      this.setDataObj(isEmpty(this.currentSpec.beforeForm) ? this.initialData : this.currentSpec.beforeForm);
      this.formObject = this.inspector.data.mainEntity;
    },
    onInactiveOperations() {
      this.currentSpec.afterForm = this.inspector.data.mainEntity;
      this.opsObject = this.currentSpec.afterForm;
    },
    onActiveOperations() {
      this.opsObject = this.inspector.data.mainEntity;
    },
    reset() {
      this.$store.dispatch('setInspectorStatusValue', {
        property: 'editing',
        value: false,
      });
    },
    setActive(step) {
      if (step === 'form') {
        this.onActiveForm();
      }
      if (step === 'operations') {
        this.onActiveOperations();
      }
      this.activeStep = step;
    },
    isActive(step) {
      return this.activeStep === step;
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
        @click="setActive('form')"
        @keyup.enter="setActive('form')"
        tabindex="0"
        :is-active="isActive('form')"
        :form-obj="formObject"
        @onInactive="onInactiveForm"
        @onActive="onActiveForm"
      />
      <operations-builder
        @click="setActive('operations')"
        @keyup.enter="setActive('operations')"
        tabindex="0"
        :is-active="isActive('operations')"
        :form-data="opsObject"
        @onInactive="onInactiveOperations"
        @onActive="onActiveOperations"
      />
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
