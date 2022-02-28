<script>
/*
  Inspecting path component
*/
import { get } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as LxlDataUtil from 'lxljs/data';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import LensMixin from '@/components/mixins/lens-mixin';
import EntityForm from './entity-form.vue';
import SummaryNode from '@/components/shared/summary-node.vue';
import TabMenu from '@/components/shared/tab-menu';
import Button from '@/components/shared/button';
import VersionHistoryChangesets from './version-history-changesets.vue';

export default {
  mixins: [LensMixin],
  props: {
    inspectingPath: {
      type: String,
      default: '',
    },
    fullHistoryData: {
      type: Object,
      default: () => [],
    },
  },
  data() {
    return {
      historyData: null,
      filteredChangeSets: null,
      selectedVersion: 0,
      fetchedVersionData: null,
    };
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    inspectingPathTranslated() {
      if (this.inspectingPath === '') return '';
      const path = this.inspectingPath;
      const split = path.split('.');
      split.splice(0, 1);
      let result = '';
      for (let i = 0; i < split.length; i++) {
        if (i > 0) {
          result += ' > ';
        }
        let value = split[i];
        value = value.replace(/(\[.*?\])/g, '');
        value = StringUtil.getLabelByLang(value, this.user.settings.language, this.resources);
        value = value[0].toUpperCase() + value.substring(1);
        result += value;
      }
      return result;
    },
    inspectingPathData() {
      const fullData = this.fetchedVersionData;
      if (fullData == null || this.inspectingPath == '') return null;
      const formObj = {};
      const formPathParts = this.inspectingPath.split('.');
      const pathToObject = StringUtil.arrayPathToString(formPathParts.slice(0, formPathParts.length - 1));
      const objectToReplicate = get(fullData, pathToObject);
      formObj['@type'] = objectToReplicate['@type'];
      formObj[this.inspectingPath.split('.').pop()] = get(fullData, this.inspectingPath);
      if (Object.keys(formObj).length == 0) return null;
      return formObj;
    },
    changeSetsReversed() {
      if (this.changeSets != null) {
        return [...this.changeSets].reverse();
      }
      return null;
    },
    changeSets() {
      if (this.filteredChangeSets != null) {
        return this.filteredChangeSets;
      }
      return null;
    },
    focusData() {
      if (this.fetchedVersionData) {
        return this.fetchedVersionData.mainEntity;
      }
      return this.inspector.data.mainEntity;
    },
    selectedChangeSet() {
      if (this.changeSetsReversed != null) {
        return this.changeSetsReversed[this.selectedVersion];
      }
      return null;
    },
    currentVersionDiff() {
      return {
        modified: this.modifiedPathsInCurrentVersion,
        added: this.addedPathsInCurrentVersion,
      };
    },
    modifiedPathsInCurrentVersion() {
      if (this.selectedChangeSet == null || this.selectedChangeSet.hasOwnProperty('modifiedPaths') === false) return [];
      const modified = this.selectedChangeSet.modifiedPaths;
      const convertedModified = [];
      modified.forEach((modifiedPath) => {
        const path = StringUtil.arrayPathToString(modifiedPath);
        convertedModified.push(path);
      });
      return convertedModified;
    },
    addedPathsInCurrentVersion() {
      if (this.selectedChangeSet == null || this.selectedChangeSet.hasOwnProperty('addedPaths') === false) return [];
      const added = this.selectedChangeSet.addedPaths;
      const convertedAdded = [];
      added.forEach((addedPath) => {
        const path = StringUtil.arrayPathToString(modifiedPath);
        convertedAdded.push(path);
      });
      return convertedAdded;
    },
    recordType() {
      if (this.fetchedVersionData.hasOwnProperty('mainEntity')) {
        return VocabUtil.getRecordType(
          this.fetchedVersionData.mainEntity['@type'],
          this.resources.vocab,
          this.resources.context,
        );
      }
      return null;
    },
    editorTabs() {
      return [{ id: 'mainEntity', text: this.$options.filters.labelByLang(this.recordType) },
        { id: 'record', text: 'Admin metadata' }];
    },
  },
  watch: {
    selectedVersion(val, oldval) {
      if (val !== oldval) {
        this.fetchVersion(val);
      }
    },
    'inspector.event'(val) {
      if (val.name === 'field-label-clicked') {
        this.inspectingPath = val.value;
      }
    },
    inspectingPath(val, oldval) {
      if (val != oldval) {
        this.filterAndSetChangeSets(this.fullHistoryData);
      }
    }
  },
  methods: {
    changeSelectedVersion(val) {
      this.selectedVersion = val;
    },
    gotoPrevVersion() {
      if (this.selectedVersion > 0) {
        this.changeSelectedVersion(this.selectedVersion - 1);
      }
    },
    gotoNextVersion() {
      if (this.selectedVersion < this.changeSets.length - 1) {
        this.changeSelectedVersion(this.selectedVersion + 1);
      }
    },
    filterAndSetChangeSets(historyData) {
      if (historyData == null || historyData.hasOwnProperty('changeSets') == false) return;
      const result = historyData.changeSets.filter((changeSet) => {
        let shouldBeAdded = false;
        if (changeSet.addedPaths) {
          changeSet.addedPaths.forEach((path) => {
            const pathChanged = StringUtil.arrayPathToString(path);
            console.log("Inspecting: ", this.inspectingPath, "Changed: ", pathChanged, "Match? ", pathChanged.includes(this.inspectingPath));
            if (pathChanged.includes(this.inspectingPath)) {
              shouldBeAdded = true;
            };
          });
        }
        if (changeSet.modifiedPaths) {
          changeSet.modifiedPaths.forEach((path) => {
            const pathChanged = StringUtil.arrayPathToString(path);
            console.log("Inspecting: ", this.inspectingPath, "Changed: ", pathChanged, "Match? ", pathChanged.includes(this.inspectingPath));
            if (pathChanged.includes(this.inspectingPath)) {
              shouldBeAdded = true;
            };
          });
        }
        if (changeSet.removedPaths) {
          changeSet.removedPaths.forEach((path) => {
            const pathChanged = StringUtil.arrayPathToString(path);
            console.log("Inspecting: ", this.inspectingPath, "Changed: ", pathChanged, "Match? ", pathChanged.includes(this.inspectingPath));
            if (pathChanged.includes(this.inspectingPath)) {
              shouldBeAdded = true;
            };
          });
        }
        return shouldBeAdded;
      });
      this.filteredChangeSets = result;
      this.fetchVersion(0);
    },
    closePropertyDetails() {
      this.$emit('close');
    },
    fetchVersion(number) {
      if (this.changeSetsReversed == null || this.changeSetsReversed.length == 0) return;
      const fetchUrl = this.changeSetsReversed[number].version['@id'];
      fetch(fetchUrl).then(response => response.json()).then((result) => {
        this.fetchedVersionData = LxlDataUtil.splitJson(result);
      });
    },
  },
  components: {
    EntityForm,
    SummaryNode,
    TabMenu,
    'button-component': Button,
    VersionHistoryChangesets,
  },
  mounted() {
    this.$nextTick(() => {
      this.filterAndSetChangeSets(this.fullHistoryData);
    });
  },
};
</script>

<template>
  <div class="VersionHistory-propertyDetails" :class="{ 'is-opened': inspectingPath.length > 0 }">
    <div class="VersionHistory-propertyDetails-header">
      <span>
      Egenskapshistorik: {{ inspectingPathTranslated }}
      </span>
      <div>
        <button-component @click="gotoPrevVersion" :inverted="true" class="Button-default" :label="'Previous change'" icon="chevron-left" size="medium" />
        <button-component @click="gotoNextVersion" :inverted="true" class="Button-default" :label="'Next change'" icon="chevron-right" size="medium" />
        <button-component @click="closePropertyDetails" :inverted="true" class="Button-default" :label="'Close'" icon="times" size="medium" />
      </div>
    </div>
    <div class="VersionHistory-propertyDetails-content">
      <div class="VersionHistory-propertyDetails-form">
        <!-- {{ inspectingPathData }} -->
        <entity-form
          :diff="currentVersionDiff"
          :is-active="true"
          v-if="inspectingPathData != null"
          :form-data="inspectingPathData"
          :locked="true">
        </entity-form>
      </div>
      <div class="VersionHistory-propertyDetails-changeSets">
        <VersionHistoryChangesets :change-sets="filteredChangeSets" :selected-version="selectedVersion" @version-selected="changeSelectedVersion" />
      </div>
    </div>
  </div>
</template>

<style lang="less">

.VersionHistory-propertyDetails {
 &-header {
    z-index: 1;
    font-weight: 600;
    background-color: @white;
    border: solid #ccc;
    border-width: 0px 0px 1px 0px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 1em;
  }
  &-content {
    z-index: 0;
    overflow: hidden;
    display: flex;
    flex-grow: 1;
    flex-direction: row;
  }
  &-form {
    flex-basis: 80%;
    padding: 2rem 3rem;
    overflow-y: scroll;
    flex-grow: 1;
  }
  &-changeSets {
    flex-basis: 20%;
  }
}


</style>
