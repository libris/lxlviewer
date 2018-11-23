<script>
import * as _ from 'lodash';
import * as CombinedTemplates from '@/resources/json/combinedTemplates.json';
import * as BaseTemplates from '@/resources/json/baseTemplates.json'; 
import * as VocabUtil from '@/utils/vocab';
import * as RecordUtil from '@/utils/record';
import * as DataUtil from '@/utils/data';
import * as StringUtil from '@/utils/string';
import CreationCard from '@/components/create/creation-card';
import FileAdder from '@/components/create/file-adder';
import TabMenu from '@/components/shared/tab-menu';

export default {
  name: 'create-new-form',
  data () {
    return {
      creationList: [
        {'id': 'Instance', 'text': 'Instance'},
        {'id': 'Work', 'text': 'Work'},
        {'id': 'Agent', 'text': 'Agent'},
        {'id': 'File', 'text': 'From file'},
      ],
      chosenType: '',
      selectedCreation: 'Instance',
      thingData: {},
      activeIndex: -1,
    }
  },
  methods: {
    getPrefLabelByLang(item) {
      const label = item.prefLabelByLang[self.language] || item.prefLabelByLang.en;
      if (typeof label === 'string') {
        return label;
      }
      return label.join(', ');
    },
    useBase(type) {
      this.chosenType = type;
      const baseRecord = Object.assign(this.baseRecord, BaseTemplates[this.selectedCreation.toLowerCase()].record);
      const baseMainEntity = Object.assign(this.baseMainEntity, BaseTemplates[this.selectedCreation.toLowerCase()].mainEntity);
      const templateValue = {
        'record': baseRecord,
        'mainEntity': baseMainEntity,
      };
      this.thingData = RecordUtil.prepareDuplicateFor(templateValue, this.user, this.settings);
    },
    useTemplate(templateValue) {
      const preparedTemplate = RecordUtil.prepareDuplicateFor(templateValue, this.user, this.settings);
      this.thingData = preparedTemplate;
    },
    setCreation(creation) {
      this.selectedCreation = creation;
      this.activeIndex = -1;
    },
    recieveFileData(data) {
      this.thingData = RecordUtil.prepareDuplicateFor(data, this.user, this.settings);
    },
    recieveFileDataOverwrite(data) {
      const packaged = DataUtil.getMergedItems(data.record, data.mainEntity, data.work, data.quoted);
      this.thingData = packaged;
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
        'descriptionCreator': {
          '@id': `https://libris.kb.se/library/${this.user.settings.activeSigel}`,
        },
        'mainEntity': {
          '@id': 'https://id.kb.se/TEMPID#it',
        },
      };
      return baseRecord;
    },
    combinedTemplates() {
      return _.sortBy(CombinedTemplates[this.selectedCreation.toLowerCase()], template => template.label);
    },
    hasChosen() {
      return this.activeIndex > 0 || (this.activeIndex === 0 && this.chosenType);
    },
  },
  components: {
    'creation-card': CreationCard,
    'file-adder': FileAdder,
    'tab-menu': TabMenu,
  },
  watch: {
    'thingData': function() {
      this.$store.dispatch('setInsertData', this.thingData);
      this.$router.push({ path: `/new` });
    },
  },
  created() {
    if (this.user.settings.appTech) {
      this.creationList.push({'id': 'Overwrite', 'text': 'Overwrite post'});
    }
  },
  mounted() { // Ready method is deprecated in 2.0, switch to "mounted"
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
    <div class="panel-body">
      <h1 class="Create-title mainTitle">{{'Create new' | translatePhrase}}</h1>
      <tab-menu @go="setCreation" :tabs="creationList" :active="selectedCreation"></tab-menu>
      <div v-if="selectedCreation !== 'File' && selectedCreation !== 'Overwrite'" class="Create-cards" id="creationCardPanel">
        <creation-card
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
      <file-adder type="overwrite" v-if="selectedCreation === 'Overwrite'" @output="recieveFileDataOverwrite" />
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
