<script>
import { sortBy } from 'lodash-es';
import * as RecordUtil from '@/utils/record';
import CreationCard from '@/components/create/creation-card';
import FileAdder from '@/components/create/file-adder';
import TabMenu from '@/components/shared/tab-menu';

export default {
  name: 'create-new-form',
  data() {
    return {
      creationList: [
        { id: 'Instance', text: 'Instance' },
        { id: 'Work', text: 'Work' },
        { id: 'Agent', text: 'Agent' },
        { id: 'File', text: 'From file' },
      ],
      chosenType: '',
      selectedCreation: 'Instance',
      thingData: {},
      activeIndex: -1,
      excludeBases: ['Agent'],
    };
  },
  methods: {
    getPrefLabelByLang(item) {
      const label = item.prefLabelByLang[this.user.settings.language] || item.prefLabelByLang.en;
      if (typeof label === 'string') {
        return label;
      }
      return label.join(', ');
    },
    useBase(type) {
      this.chosenType = type;
      const BaseTemplates = require('@/resources/json/baseTemplates');
      const baseRecord = Object.assign(this.baseRecord, BaseTemplates[this.selectedCreation.toLowerCase()].record);
      const baseMainEntity = Object.assign(this.baseMainEntity, BaseTemplates[this.selectedCreation.toLowerCase()].mainEntity);
      const templateValue = {
        record: baseRecord,
        mainEntity: baseMainEntity,
      };
      this.thingData = RecordUtil.prepareDuplicateFor(templateValue, this.user, this.settings.keysToClear.duplication);
    },
    useTemplate(templateValue) {
      const preparedTemplate = RecordUtil.prepareDuplicateFor(templateValue, this.user, this.settings.keysToClear.duplication);
      this.thingData = preparedTemplate;
    },
    setCreation(creation) {
      this.selectedCreation = creation;
      this.activeIndex = -1;
    },
    recieveFileData(data) {
      this.thingData = RecordUtil.prepareDuplicateFor(data, this.user, this.settings.keysToClear.duplication);
    },
    setActiveIndex(index) {
      this.activeIndex = index;
    },
  },
  events: {
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    settings() {
      return this.$store.getters.settings;
    },
    baseMainEntity() {
      const baseMainEntity = {
        '@id': 'https://id.kb.se/TEMPID#it',
        '@type': this.chosenType,
      };
      return baseMainEntity;
    },
    baseRecord() {
      const baseRecord = {
        '@type': 'Record',
        '@id': 'https://id.kb.se/TEMPID',
        descriptionCreator: {
          '@id': `https://libris.kb.se/library/${this.user.settings.activeSigel}`,
        },
        mainEntity: {
          '@id': 'https://id.kb.se/TEMPID#it',
        },
      };
      return baseRecord;
    },
    combinedTemplates() {
      const CombinedTemplates = require('@/resources/json/combinedTemplates');
      return sortBy(CombinedTemplates[this.selectedCreation.toLowerCase()], template => template.label);
    },
    hasChosen() {
      return this.activeIndex > 0 || (this.activeIndex === 0 && this.chosenType);
    },
    isExcludedBase() {
      return this.excludeBases.indexOf(this.selectedCreation) > -1;
    },
  },
  components: {
    'creation-card': CreationCard,
    'file-adder': FileAdder,
    'tab-menu': TabMenu,
  },
  watch: {
    thingData() {
      this.$store.dispatch('setInsertData', this.thingData);
      this.$router.push({ path: '/new' });
    },
  },
  created() {

  },
  mounted() {
    this.$nextTick(() => {
      this.activeForm = '';
      this.transition = false;
      this.initialized = true;
    });
  },
};
</script>

<template>
  <div class="Create" id="create-new-post">
    <div class="Create-body">
      <tab-menu @go="setCreation" :tabs="creationList" :active="selectedCreation"></tab-menu>
      <div v-if="selectedCreation !== 'File'" class="Create-cards" id="creationCardPanel">
        <creation-card
          v-if="!isExcludedBase"
          :is-base="true"
          :creation="selectedCreation"
          :index="0"
          :active-index="activeIndex"
          @use-base="useBase"
          @set-active-index="setActiveIndex" />
        <creation-card
          v-for="(template, index) in combinedTemplates"
          :key="index"
          :is-base="false"
          :template="template"
          :index="index + 1"
          :active-index="activeIndex"
          @use-template="useTemplate"
          @set-active-index="setActiveIndex" />
      </div>
      <file-adder type="new" v-if="selectedCreation === 'File'" @output="recieveFileData" />
    </div>
  </div>
</template>

<style lang="less">
.Create {
  &-title {
  }
  &-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}

</style>
