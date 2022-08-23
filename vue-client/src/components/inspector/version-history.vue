<script>
/*
  The full version history view
*/
import { get, set, cloneDeep, isEmpty, isEqual, isObject } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as LxlDataUtil from 'lxljs/data';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import * as DataUtil from '@/utils/data';
import LensMixin from '@/components/mixins/lens-mixin';
import EntityForm from './entity-form.vue';
import TabMenu from '@/components/shared/tab-menu';
import VersionHistoryChangesets from './version-history-changesets.vue';

export default {
  mixins: [LensMixin],
  props: {
  },
  data() {
    return {
      historyData: null,
      modified: null,
      selectedVersion: 0,
      displayData: null,
      previousVersionData: null,
      currentVersionData: null,
      focusedTab: 'mainEntity',
      inspectingPath: '',
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
    focusData() {
      if (this.displayData) {
        return this.displayData.mainEntity;
      }
      return this.inspector.data.mainEntity;
    },
    selectedChangeSet() {
      return this.changeSetsReversed[this.selectedVersion];
    },
    changeSets() {
      if (this.historyData != null && this.historyData.hasOwnProperty('changeSets')) {
        return this.historyData.changeSets;
      }
      return null;
    },
    changeSetsReversed() {
      if (this.changeSets != null) {
        return [...this.changeSets].reverse();
      }
      return null;
    },
    currentVersionDiff() {
      return {
        added: this.addedPathsInCurrentVersion,
        removed: this.removedPathsInCurrentVersion,
        modified: [],
      };
    },
    addedPathsInCurrentVersion() {
      if (this.selectedChangeSet.hasOwnProperty('addedPaths') === false) return [];
      const added = this.selectedChangeSet.addedPaths;
      const convertedAdded = [];
      added.forEach((addedPath) => {
        const thePath = StringUtil.arrayPathToString(addedPath);
        const objectAtPath = get(this.currentVersionData, thePath);
        if (thePath.endsWith('.@id')) {
          const elementPath = thePath.slice(0, thePath.lastIndexOf('.'));
          convertedAdded.push({ path: elementPath, val: { '@id': objectAtPath } });
        } else {
          convertedAdded.push({ path: thePath, val: objectAtPath });
        }
      });
      return convertedAdded;
    },
    removedPathsInCurrentVersion() {
      if (this.selectedChangeSet.hasOwnProperty('removedPaths') === false) return [];
      const removed = this.selectedChangeSet.removedPaths;
      const convertedRemoved = [];
      removed.forEach((removedPath) => {
        const thePath = StringUtil.arrayPathToString(removedPath);
        const objectAtPath = get(this.previousVersionData, thePath);
        if (thePath.endsWith('.@id')) {
          const elementPath = thePath.slice(0, thePath.lastIndexOf('.'));
          convertedRemoved.push({ path: elementPath, val: { '@id': objectAtPath } });
        } else {
          convertedRemoved.push({ path: thePath, val: objectAtPath });
        }
      });
      return convertedRemoved;
    },
    recordType() {
      if (this.displayData.hasOwnProperty('mainEntity')) {
        return VocabUtil.getRecordType(
          this.displayData.mainEntity['@type'],
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
        this.setDisplayDataFor(val);
      }
    },
    'inspector.event'(val) {
      if (val.name === 'field-label-clicked') {
        const lastChanged = this.changeSetsReversed.find((changeSet) => {
          if (changeSet.hasOwnProperty('addedPaths') || changeSet.hasOwnProperty('removedPaths')) {
            const all = changeSet.addedPaths.concat(changeSet.removedPaths);
            return all.find(path => StringUtil.arrayPathToString(path).includes(val.value));
          }
          return false;
        });
        const index = this.changeSetsReversed.indexOf(lastChanged);
        if (index !== -1) {
          this.changeSelectedVersion(index);
        }
      }
    },
  },
  methods: {
    changeSelectedVersion(val) {
      this.selectedVersion = val;
    },
    setEditorFocus(value) {
      this.focusedTab = value;
      this.$store.dispatch('pushInspectorEvent', { name: 'form-control', value: 'focus-changed' });
    },
    setDisplayData() {
      const fnurgel = this.$route.params.fnurgel;
      // _changesets
      const fetchUrl = `${this.settings.apiPath}/${fnurgel}/_changesets`;
      fetch(fetchUrl).then(response => response.json()).then((result) => {
        this.historyData = result;

        const agents = this.changeSets.map(c => c.agent).filter(a => a)
        DataUtil.fetchMissingLinkedToQuoted(agents, this.$store);

        this.setDisplayDataFor(0);
      });
    },
    async setDisplayDataFor(number) {
      if (this.changeSetsReversed == null) return;
      
      const options = {
        headers: {
          Accept: 'application/ld+json',
        },
      };

      const fetchUrl = this.changeSetsReversed[number].version['@id'];
      this.currentVersionData = await fetch(fetchUrl, options)
        .then(response => response.json())
        .then((result) => {
          DataUtil.fetchMissingLinkedToQuoted(result, this.$store);
          return LxlDataUtil.splitJson(result);
        });

      const previousChangeSet = this.changeSetsReversed[number + 1];
      if (previousChangeSet === undefined) {
        this.displayData = this.currentVersionData;
        return;
      }
      this.previousVersionData = await fetch(previousChangeSet.version['@id'], options)
        .then(response => response.json())
        .then((result) => {
          DataUtil.fetchMissingLinkedToQuoted(result, this.$store);
          return LxlDataUtil.splitJson(result);
        });

      const diff = this.currentVersionDiff;
      const compositeVersionData = cloneDeep(this.currentVersionData);
      if (!isEmpty(diff.removed)) {
        diff.removed.forEach((r) => {
          const isListItem = r.path.slice(-1) === ']';
          if (isListItem && isObject(r.val)) {
            const parentPath = r.path.slice(0, r.path.lastIndexOf('['));
            const parentObj = get(compositeVersionData, parentPath);
            parentObj.push(r.val);
            set(compositeVersionData, parentPath, parentObj);
          } else {
            const added = diff.added.find(a => isEqual(a.path, r.path));
            if (added !== undefined && r.val !== added.val) {
              if (typeof r.val === 'string') {
                const from = StringUtil.getLabelByLang(r.val, this.user.settings.language, this.resources);
                const to = StringUtil.getLabelByLang(added.val, this.user.settings.language, this.resources);
                const moddedValue = from.concat(' → ').concat(to);
                diff.modified.push({ path: r.path, val: moddedValue });
                set(compositeVersionData, r.path, moddedValue);
              } else {
                diff.modified.push({ path: r.path, val: added.val });
                set(compositeVersionData, r.path, added.val);
              }
            } else {
              set(compositeVersionData, r.path, r.val);
            }
          }
        });
      }
      await this.$store.dispatch('setCompositeHistoryData', compositeVersionData);
      this.displayData = compositeVersionData;
    },
  },
  components: {
    EntityForm,
    TabMenu,
    VersionHistoryChangesets,
  },
  mounted() {
    this.$nextTick(() => {
      this.setDisplayData();
    });
  },
};
</script>

<template>
  <div class="VersionHistory container-fluid">
    <div class="row">
      <div class="col-md-10 VersionHistory-mainCol">
        <div class="VersionHistory-header">
          <span class="VersionHistory-backLink">
            <a @click="$router.go(-1)"><i class="fa fa-arrow-left"></i> Tillbaka</a>
          </span>
          <span class="VersionHistory-headerTitle" v-if="displayData != null">
            {{ getItemLabel }}
          </span>
        </div>
        <div class="VersionHistory-content">
          <template v-if="displayData != null">
            <tab-menu @go="setEditorFocus" :tabs="editorTabs" :active="focusedTab" />
            <entity-form
              v-for="tab in editorTabs"
              :editing-object="tab.id"
              :key="tab.id"
              :diff="currentVersionDiff"
              :is-active="focusedTab === tab.id"
              :form-data="displayData[tab.id]"
              :locked="true">
            </entity-form>
          </template>
        </div>
      </div>
      <div class="col-md-2 VersionHistory-sideCol">
        <div class="VersionHistory-header">
          Ändringshistorik
        </div>
        <VersionHistoryChangesets :change-sets="changeSets" :selected-version="selectedVersion" @version-selected="changeSelectedVersion" />
      </div>
    </div>
  </div>
</template>

<style lang="less">

.VersionHistory {
  background-color: @bg-site;
  &-mainCol {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  &-sideCol {
    box-shadow: @fullscreen-panel-shadow;
    z-index: 2;
    height: 100vh;
  }
  &-backLink {
    font-weight: normal;
    a {
      color: inherit;
    }
  }
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
  &-headerTitle {
    font-weight: 600;
  }
  &-content {
    z-index: 0;
    padding: 2rem 3rem;
    overflow-y: scroll;
    flex-grow: 1;
  }
  &-changeSets {
    background-color: @white;
  }
  .row > div {
    padding: 0;
  }
}

.ChangeSet {
  border-style: solid;
  border-width: 0px 0px 1px 0px;
  border-color: #ccc;
  &-changeSetContainer {
    display: flex;
    flex-direction: column;
    border-style: solid;
    border-width: 0px 0px 0px 4px;
    border-color: transparent;
    padding: 0.75rem 0.75rem 0.75rem 1.5rem;
    &.selected {
      border-left-color: @brand-primary;
    }
  }
  &-currentVersion {
    font-size: 0.75em;
    text-transform: uppercase;
    &.selected {
      color: @brand-primary;
    }
  }
  &-date {
    font-weight: 600;
    &.selected {
      color: @brand-primary;
    }
  }
  &-agent {
    font-size: 0.9em;
  }
}


</style>