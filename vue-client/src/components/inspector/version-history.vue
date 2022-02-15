<script>
/*
  The full version history view
*/
import { isNumber } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as LxlDataUtil from 'lxljs/data';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import LensMixin from '@/components/mixins/lens-mixin';
import EntityForm from './entity-form.vue';
import SummaryNode from '@/components/shared/summary-node.vue';
import TabMenu from '@/components/shared/tab-menu';
import Button from '@/components/shared/button';

export default {
  mixins: [LensMixin],
  props: {
  },
  data() {
    return {
      historyData: null,
      selectedVersion: 0,
      fetchedVersionData: null,
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
    inspectingPathTranslated() {
      if (this.inspectingPath == '') return '';
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
    changeSetsReversed() {
      if (this.historyData != null) {
        return [...this.historyData.changeSets].reverse();
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
      return this.changeSetsReversed[this.selectedVersion];
    },
    currentVersionDiff() {
      return {
        modified: this.modifiedPathsInCurrentVersion,
        added: this.addedPathsInCurrentVersion,
      };
    },
    modifiedPathsInCurrentVersion() {
      if (this.selectedChangeSet.hasOwnProperty('modifiedPaths') == false) return [];
      const modified = this.selectedChangeSet.modifiedPaths;
      const convertedModified = [];
      modified.forEach((modifiedPath) => {
        let path = '';
        for (let i = 0; i < modifiedPath.length; i++) {
          if (isNumber(modifiedPath[i])) {
            path += `[${modifiedPath[i]}]`
          } else {
            if (i != 0) {
              path += '.';
            }
            path += modifiedPath[i];
          }
        }
        path = path.replace('@graph[0]', 'record');
        path = path.replace('@graph[1]', 'mainEntity');
        convertedModified.push(path)
      });
      return convertedModified;
    },
    addedPathsInCurrentVersion() {
      if (this.selectedChangeSet.hasOwnProperty('addedPaths') == false) return [];
      const added = this.selectedChangeSet.addedPaths;
      const convertedAdded = [];
      added.forEach((addedPath) => {
        let path = '';
        for (let i = 0; i < addedPath.length; i++) {
          if (isNumber(addedPath[i])) {
            path += `[${addedPath[i]}]`
          } else {
            if (i != 0) {
              path += '.';
            }
            path += addedPath[i];
          }
        }
        path = path.replace('@graph[0]', 'record');
        path = path.replace('@graph[1]', 'mainEntity');
        convertedAdded.push(path)
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
      if (val != oldval) {
        this.fetchVersion(val);
      }
    },
    'inspector.event'(val) {
      if (val.name === 'field-label-clicked') {
        this.inspectingPath = val.value;
      }
    },
  },
  methods: {
    closePropertyDetails() {
      this.inspectingPath = '';
    },
    setEditorFocus(value) {
      this.focusedTab = value;
      this.$store.dispatch('pushInspectorEvent', { name: 'form-control', value: 'focus-changed' });
    },
    fetchHistoryData() {
      const fnurgel = this.$route.params.fnurgel;
      // _changesets
      const fetchUrl = `${this.settings.apiPath}/${this.$route.params.fnurgel}/_changesets`;
      fetch(fetchUrl).then((response) => {
        return response.json();
      }).then((result) => {
        this.historyData = result;
        this.fetchVersion(0);
      });
    },
    fetchVersion(number) {
      const fetchUrl = this.changeSetsReversed[number].version['@id'];
      fetch(fetchUrl).then((response) => {
        return response.json();
      }).then((result) => {
        this.fetchedVersionData = LxlDataUtil.splitJson(result);
      });
    },
  },
  components: {
    EntityForm,
    SummaryNode,
    TabMenu,
    'button-component': Button,
  },
  mounted() {
    this.$nextTick(() => {
      this.fetchHistoryData();
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
          <span class="VersionHistory-headerTitle" v-if="fetchedVersionData != null">
            {{ getItemLabel }}
          </span>
        </div>
        <div class="VersionHistory-content">
          <template v-if="fetchedVersionData != null">
            <tab-menu @go="setEditorFocus" :tabs="editorTabs" :active="focusedTab" />
            <entity-form
              v-for="tab in editorTabs"
              :editing-object="tab.id"
              :key="tab.id"
              :diff="currentVersionDiff"
              :is-active="focusedTab === tab.id"
              :form-data="fetchedVersionData[tab.id]"
              :locked="true">
            </entity-form>
          </template>
        </div>
        <div class="VersionHistory-propertyDetails" :class="{ 'is-opened': inspectingPath.length > 0 }">
          <div class="VersionHistory-header">
            <span>
            Egenskapshistorik: {{ inspectingPathTranslated }}
            </span>
            <button-component @click="closePropertyDetails" :inverted="true" class="Button-default" :label="'Close'" icon="times" size="medium" />
          </div>
          <div class="VersionHistory-content">
            Detailed change information about {{ inspectingPath }}
          </div>
        </div>
      </div>
      <div class="col-md-2 VersionHistory-sideCol">
        <div class="VersionHistory-header">
          Ändringshistorik
        </div>
        <div class="VersionHistory-changeSets" v-if="historyData">
          <div class="ChangeSet" v-for="(changeSet, index) in changeSetsReversed" :key="changeSet.date" @click="selectedVersion = index" :class="{ 'selected': selectedVersion == index }">
            <div class="ChangeSet-changeSetContainer" :class="{ 'selected': selectedVersion == index }">
              <span class="ChangeSet-currentVersion" :class="{ 'selected': selectedVersion == index }" v-if="index == 0">Aktuell version</span>
              <span class="ChangeSet-date" :class="{ 'selected': selectedVersion == index }">{{ $moment(changeSet.date).format('lll') }}</span>
              <span class="ChangeSet-author" :class="{ 'selected': selectedVersion == index }">
                <SummaryNode :is-static="true" :hover-links="false" v-if="changeSet.agent" :item="changeSet.agent" :is-last="true" :field-key="'agent'"/>
              </span>
            </div>
          </div>
        </div>
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
    z-index: 2;
    height: 100vh;
    box-shadow: @fullscreen-panel-shadow;
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
    box-shadow: @fullscreen-panel-shadow;
    border: 1px solid #ccc;
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
  &-propertyDetails {
    z-index: 1;
    box-shadow: @fullscreen-panel-shadow;
    flex-basis: 30%;
    max-height: 0%;
    transition: max-height 0.25s ease;
    &.is-opened {
      max-height: 30%;
    }
  }
  &-changeSets {
    background-color: @white;
    border: 1px solid #ccc;
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
    border-width: 0px 0px 0px 3px;
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
