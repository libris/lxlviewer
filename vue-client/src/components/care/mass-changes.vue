<script>
import FormBuilder from '@/components/care/form-builder.vue';
import OperationsBuilder from '@/components/care/operations-builder.vue';
import { mapGetters } from 'vuex';
import {cloneDeep, isEmpty} from 'lodash-es';
import emptyTemplate from './templates/empty.json';
import toolbar from "@/components/inspector/toolbar-simple.vue";
import {translatePhrase} from "@/utils/filters.js";
import * as DataUtil from "@/utils/data.js";
import {addIds} from "@/utils/data.js";

export default {
  name: 'mass-changes.vue',
  components: {toolbar, FormBuilder, OperationsBuilder },
  data() {
    return {
      showOverview: true,
      initialData: {
        '@type': 'Instance',
        label: 'test',
        genreForm: [
          {
            '@id': 'https://id.kb.se/term/saogf/Technopop'
          }
        ]
      },
      activeStep: '',
      steps: [
        'form',
        'operations'
      ],
      runSpecifications: [],
      currentSpec: {},
      showSpec: false,
    };
  },
  computed: {
    ...mapGetters([
      'inspector',
      'status'
    ]),
    dataObj() {
      return this.inspector.data.mainEntity;
    },
    formObj() {
      return this.isActive('form') ? this.inspector.data.mainEntity : this.currentSpec.form;
    },
    opsObj() {
      return this.isActive('operations') ? this.inspector.data.mainEntity : this.currentSpec.targetForm;
    },
    formTitle() {
      return `${this.steps.indexOf('form') + 1}. ${translatePhrase('Form builder')}`
    },
    changesTitle() {
      return `${this.steps.indexOf('operations') + 1}. ${translatePhrase('Changes')}`
    }
  },
  methods: {
    translatePhrase,
    initRunSpecification(caseName) {
      const runSpec = emptyTemplate.runTemplate;
      // create a name (based on user input?)
      // default to caseName if from template. Demand the name to be unique and use it as identifier.
      runSpec.name = caseName;
      runSpec.date = this.getDateString();

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
      this.setActive(this.steps[0]);
      this.setDataObj(this.initialData);
      this.$store.dispatch('pushInspectorEvent', {
        name: 'record-control',
        value: 'start-edit',
      });
      this.initRunSpecification('Specifikationsnamn');
      this.currentSpec.form = this.initialData;
      this.currentSpec.targetForm = this.initialData;
      DataUtil.fetchMissingLinkedToQuoted(this.dataObj, this.$store);
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
      let form = cloneDeep(this.inspector.data.mainEntity);
      this.currentSpec.form = addIds(form);
    },
    onActiveForm() {
      this.setDataObj(isEmpty(this.currentSpec.form) ? this.initialData : this.currentSpec.form);
    },
    onInactiveOperations() {
      this.currentSpec.targetForm = cloneDeep(this.inspector.data.mainEntity);
    },
    reset() {
      this.$store.dispatch('setInspectorStatusValue', {
        property: 'editing',
        value: false,
      });
    },
      nextStep() {
      this.setActive(this.steps[this.steps.indexOf(this.activeStep) + 1]);
    },
    previousStep() {
      this.setActive(this.steps[this.steps.indexOf(this.activeStep) - 1]);
    },
    setActive(step) {
      if (!step) return;
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
  <div class="MassChanges row">
    <div
      class="col-sm-12"
      :class="{ 'col-md-11': !status.panelOpen, 'col-md-7': status.panelOpen }">
    <div class="MassChanges-new">
      <h1>
        <span class="MassChanges-header">Namn</span>
        <span class="badge badge-accent2">{{ translatePhrase("New run specification") }}</span>
      <!-- Visa id om det är en körning som redan finns -->
      </h1>
      <form-builder
        :title="formTitle"
        @click="setActive('form')"
        @keyup.enter="setActive('form')"
        tabindex="0"
        :is-active="isActive('form')"
        :form-data="formObj"
        @onInactive="onInactiveForm"
        @onActive="onActiveForm"
      />
      <operations-builder
        :title="changesTitle"
        @click="setActive('operations')"
        @keyup.enter="setActive('operations')"
        tabindex="0"
        :is-active="isActive('operations')"
        :form-data="opsObj"
        @onInactive="onInactiveOperations"
      />
      <div>
        SPECIFICATION
        <pre>{{this.currentSpec}}</pre>
        ENTITY FORM
        <pre>{{ this.dataObj }}</pre>
      </div>
    </div>
    </div>
    <div class="col-12 col-sm-12"
      :class="{ 'col-md-1 col-md-offset-11': !status.panelOpen, 'col-md-5 col-md-offset-7': status.panelOpen }">
      <div class="Toolbar-container">
        <toolbar
        @next="nextStep"
        @previous="previousStep"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.MassChanges {
  &-new {

  }
  &-header {
    font-size: 3rem;
    text-transform: uppercase;
    padding-bottom: 10px;
    padding-right: 1rem;
  }
}
</style>
