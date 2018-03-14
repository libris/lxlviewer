<script>
import * as _ from 'lodash';
import * as CombinedTemplates from '@/resources/json/combinedTemplates.json';
import * as BaseTemplates from '@/resources/json/baseTemplates.json'; 
import * as VocabUtil from '@/utils/vocab';
import * as StringUtil from '@/utils/string';
import CreationCard from '@/components/createnew/creation-card';
import CreateOptions from '@/components/createnew/create-options';

export default {
  name: 'create-new-form',
  data () {
    return {
      creationList: ['Instance', 'Work', 'Agent', 'Concept', 'File'],
      chosenType: '',
      selectedCreation: 'Instance',
      thingData: {},
      activeIndex: -1,
      userIsDropping: false,
      invalidFile: false,
      droppedFile: {},
    }
  },
  methods: {
    initDropzone() {
      window.addEventListener("dragover",function(e){
        e = e || event;
        e.preventDefault();
      }, false);
      window.addEventListener("drop",function(e){
        e = e || event;
        e.preventDefault();
      }, false);
      const self = this;
      this.$refs.dropzone.addEventListener('dragenter', function(e) {
        e.preventDefault();
        self.userIsDropping = true;
      });
      this.$refs.dropzone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        self.userIsDropping = false;
      });
      this.$refs.dropzone.addEventListener('drop', function(e) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onloadend = function() {
          try {
            const data = JSON.parse(this.result);
            self.droppedFile = data;
          } catch (e) {
            self.invalidFile = true;
          }
        };
        reader.readAsText(e.dataTransfer.files[0]);
      });
    },
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
      this.thingData = {
        '@graph': [
          baseRecord,
          baseMainEntity,
        ],
      };
    },
    useTemplate(templateValue) {
      const templateRecord = Object.assign(this.baseRecord, templateValue.record);
      const templateMainEntity = Object.assign(this.baseMainEntity, templateValue.mainEntity);

      // CLEAN IDS
      templateRecord['@id'] = 'https://id.kb.se/TEMPID';
      templateMainEntity['@id'] = 'https://id.kb.se/TEMPID#it';

      this.thingData = {
        '@graph': [
          templateRecord,
          templateMainEntity,
        ],
      };
    },
    setCreation(creation) {
      this.selectedCreation = creation;
      this.activeIndex = -1;
      if (creation === 'File') {
        this.$nextTick(() => {
          this.initDropzone();
        });
      }
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
    'create-options': CreateOptions,
  },
  watch: {
    'thingData': function() {
      this.$store.dispatch('setInsertData', this.thingData);
      this.$router.push({ path: `/new` });
    },
    'droppedFile': function(val) {
      if (val.hasOwnProperty('@graph')) {
        this.thingData = val;
      } else {
        this.invalidFile = true;
      }
    },
    'invalidFile': function(val) {
      if (val === true) {
        setTimeout(() => {
          this.invalidFile = false;
          this.userIsDropping = false;
        }, 3000);
      }
    },
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
  <div class="Create panel panel-default" id="create-new-post">
    <div class="panel-body">
      <h1 class="Create-title">{{'Create new' | translatePhrase}}</h1>
        <create-options
          :creation-list="creationList"
          @set-creation="setCreation" />
        <div v-if="selectedCreation !== 'File'" class="Create-cards" id="creationCardPanel">
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
        <div class="Dropzone" v-if="selectedCreation === 'File'" :class="{'is-active': userIsDropping, 'is-invalid': invalidFile}">
          <div class="Dropzone-mask" ref="dropzone"></div>
          <div class="Dropzone-container">
            <div class="Dropzone-description" v-show="!invalidFile">{{'Drop your file here' | translatePhrase}}</div>
            <div class="Dropzone-description" v-show="invalidFile">{{'Invalid file' | translatePhrase}}</div>
          </div>
        </div>
    </div>
  </div>
</template>

<style lang="less">
.Create {
  &-title {
    font-size: 24px;
    font-size: 2.4rem;
    font-weight: 500;
  }

  &-cards {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -1em;
  }
}
.Dropzone {
  margin-top: 1em;
  height: 300px;
  width: 100%;
  padding: 2px;
  border: 1px solid #E0E6E9;
  &.is-active {
    background-color: fadeout(@brand-primary, 50%);
    border: 3px dashed @brand-primary;
    padding: 0px;
  }
  &.is-invalid {
    background-color: fadeout(@brand-danger, 50%);
    border: 3px dashed @brand-danger;
  }
  &-title {
    font-size: 24px;
    font-size: 2.4rem;
    font-weight: 500;
  }
  &-container {
    display: flex;
    position: relative;
    top: -100%;
    flex-direction: row;
    align-items: center;
    width: inherit;
    height: inherit;
  }
  &-description {
    text-align: center;
    width: 100%;
  }
  &-mask {
    position: relative;
    width: inherit;
    height: inherit;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0);
  }
}
</style>
