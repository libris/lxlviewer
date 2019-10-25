<script>
import { sortBy } from 'lodash-es';
import * as RecordUtil from '@/utils/record';
import * as VocabUtil from '@/utils/vocab';
import CreationCard from '@/components/create/creation-card';
import FileAdder from '@/components/create/file-adder';
import TabMenu from '@/components/shared/tab-menu';
import ModalComponent from '@/components/shared/modal-component';
import SelectSigel from '@/components/usersettings/select-sigel';

export default {
  name: 'create-new-form',
  data() {
    return {
      chosenType: '',
      selectedCreation: 'Instance',
      thingData: {},
      activeIndex: -1,
      modalOpen: false,
      hasAllowedTemplates: false,
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
    templateIsAllowed(template) {      
      const isAllowed = this.selectedCreation != 'Concept' ||
        (this.user.uriMinter &&
          this.user.uriMinter.findContainerForEntity(template.value.mainEntity,
            {'@id': this.user.getActiveLibraryUri()}));

      this.hasAllowedTemplates = false;

      if (isAllowed) {
        this.hasAllowedTemplates = true;
      }
      
      return isAllowed;
    },
    userIsAllowedToEditConcepts() {
      if (!this.user.uriMinter) {
        return false;
      }
      const {vocab, context} = this.$store.getters.resources;
      return Object.keys(this.user.uriMinter.containerMap).find(
        it => VocabUtil.isSubClassOf(it, 'Concept', vocab, context));
    },
    getUserRecordType() {
      const {vocab, context} = this.$store.getters.resources;

      
    },
    closeModal() {
      this.modalOpen = false;
    },
  },
  events: {
  },
  computed: {
    creationList() {
      const list = [
        { id: 'Instance', text: 'Instance' },
        { id: 'Work', text: 'Work' },
        { id: 'Agent', text: 'Agent', excludeBase: true },
      ];      
      if (this.userIsAllowedToEditConcepts()) {
        list.push({ id: 'Concept', text: 'Concept', excludeBase: true });
      }
      list.push({ id: 'File', text: 'From file' });

      return list;
    },
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
          '@id': this.user.getActiveLibraryUri(),
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
      return this.creationList.find(it => it.id === this.selectedCreation).excludeBase;
    },
  },
  components: {
    'creation-card': CreationCard,
    'file-adder': FileAdder,
    'tab-menu': TabMenu,
    'modal-component': ModalComponent,
    'select-sigel': SelectSigel,
  },
  watch: {
    thingData() {
      this.$store.dispatch('setInsertData', this.thingData);
      this.$router.push({ path: '/new' });
    },
    selectedCreation() {
      this.hasAllowedTemplates = true;  
    },
    hasAllowedTemplates(val) {
      if  (!val) {
        this.modalOpen = true;
      }
    }
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
      <modal-component 
        v-if="modalOpen"        
        class="SelectSigelModal" 
        :title="'Switch sigel' | translatePhrase"
        :top="'28rem'"
        :width="'570px'"        
        @close="closeModal">
        <div slot="modal-body" class="SelectSigelModal-body">
          <p>
            {{ "To create concepts, you need to switch to a seal with correct authority." | translatePhrase }}
          </p>          
          <div class="SelectSigelModal-buttonContainer">          
            <select-sigel 
              id="UserConfig-sigel"
              :update-on-change="false" 
              @changed="closeModal" />            
          </div>
        </div>
      </modal-component>
      <div v-if="selectedCreation !== 'File'" class="Create-cards" id="creationCardPanel">
        <creation-card
          v-if="!isExcludedBase"
          :is-base="true"
          :is-allowed="true"
          :creation="selectedCreation"
          :index="0"
          :active-index="activeIndex"
          @use-base="useBase"
          @set-active-index="setActiveIndex" />
        <creation-card
          v-for="(template, index) in combinedTemplates"
          :key="index"
          :is-base="false"
          :is-allowed="templateIsAllowed(template)"
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

.SelectSigelModal {
  &-body {
    height: 80%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 24px 16px 15px 16px;
  }
  &-buttonContainer {
    text-align: right;
    margin: 20px 0 0 0;
    .btn {
      margin-left: 12px;
    }
  }
}

</style>
