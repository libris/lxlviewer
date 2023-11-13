<script>
/*
  The full version history view
*/
import { cloneDeep } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as LxlDataUtil from 'lxljs/data';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import * as DataUtil from '@/utils/data';
import * as HistoryUtil from '@/utils/history';
import { translatePhrase, labelByLang } from '@/utils/filters';
import LensMixin from '@/components/mixins/lens-mixin.vue';
import TabMenu from '@/components/shared/tab-menu.vue';
import EntityForm from './entity-form.vue';
import VersionHistoryChangesets from './version-history-changesets.vue';

export default {
  name: 'version-history',
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
      showSideCol: false,
      isFocusTrapActive: false,
      currentVersionDiff: {
        added: [],
        removed: [],
        modified: [],
      },
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
        // Reject changesets where the only thing that changed was 'modified'
        const hasOnlyModified = (changeSet) => changeSet.addedPaths.length === 1
        && changeSet.addedPaths[0].includes('modified')
        && changeSet.removedPaths.length === 1
        && changeSet.removedPaths[0].includes('modified');

        return this.historyData.changeSets.filter((changeSet) => !hasOnlyModified(changeSet));
      }
      return null;
    },
    changeSetsReversed() {
      if (this.changeSets != null) {
        return [...this.changeSets].reverse();
      }
      return null;
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
      return [{ id: 'mainEntity', text: labelByLang(this.recordType) },
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
            return all.find((path) => StringUtil.arrayPathToString(path).includes(val.value));
          }
          return false;
        });
        let index;
        if (lastChanged === undefined) {
          index = this.changeSetsReversed.length - 1; // Latest change was in the first version
        } else {
          index = this.changeSetsReversed.indexOf(lastChanged);
        }
        this.changeSelectedVersion(index);
      }
    },
    displayData() {
      this.$nextTick(() => {
        this.isFocusTrapActive = true;
      });
    },
  },
  methods: {
    translatePhrase,
    goToRecord() {
      const fnurgel = this.$route.params.fnurgel;
      this.$router.push({ path: `/${fnurgel}` });
    },
    changeSelectedVersion(val) {
      this.selectedVersion = val;
      this.closeSideCol();
    },
    setEditorFocus(value) {
      this.focusedTab = value;
      this.$store.dispatch('pushInspectorEvent', { name: 'form-control', value: 'focus-changed' });
    },
    setDefaultFocusedTab() {
      if (!this.currentVersionDiff.added.some((path) => path.includes('mainEntity'))
        && !this.currentVersionDiff.removed.some((path) => path.includes('mainEntity'))
        && !this.currentVersionDiff.modified.some((path) => path.includes('mainEntity'))) {
        this.focusedTab = 'record';
      } else {
        this.focusedTab = 'mainEntity';
      }
    },
    setDisplayData() {
      const fnurgel = this.$route.params.fnurgel;
      // _changesets
      const fetchUrl = `${this.settings.apiPath}/${fnurgel}/_changesets`;
      fetch(fetchUrl).then((response) => response.json()).then((result) => {
        this.historyData = result;
        const agents = (this.changeSets || []).map((c) => c.agent).filter((a) => a);
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
        .then((response) => response.json())
        .then((result) => DataUtil.moveWorkToInstance(LxlDataUtil.splitJson(result)));

      const previousChangeSet = this.changeSetsReversed[number + 1];
      if (previousChangeSet === undefined) {
        this.displayData = this.currentVersionData;
        return;
      }

      this.previousVersionData = await fetch(previousChangeSet.version['@id'], options)
        .then((response) => response.json())
        .then((result) => DataUtil.moveWorkToInstance(LxlDataUtil.splitJson(result)));

      const [displayData, displayPaths] = HistoryUtil.buildDisplayData(
        this.previousVersionData,
        this.currentVersionData,
        this.selectedChangeSet.addedPaths,
        this.selectedChangeSet.removedPaths,
        (s) => StringUtil.getLabelByLang(s, this.user.settings.language, this.resources),
      );

      this.currentVersionDiff = displayPaths;
      this.fetchMissingLinks(displayData);
      await this.$store.dispatch('setCompositeHistoryData', displayData);
      this.displayData = displayData;
      this.setDefaultFocusedTab();
    },
    fetchMissingLinks(data) {
      const toFetch = cloneDeep(data);
      delete toFetch.mainEntity.sameAs;
      delete toFetch.record.sameAs;
      DataUtil.fetchMissingLinkedToQuoted(toFetch, this.$store);
    },
    openSideCol() {
      this.showSideCol = true;
    },
    closeSideCol() {
      this.showSideCol = false;
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
  <!-- eslint-disable-next-line vue/no-v-model-argument -->
  <focus-trap
    v-model:active="isFocusTrapActive"
    :escape-deactivates="false"
    :delay-initial-focus="true">
    <div class="VersionHistory" tabindex="-1">
      <div class="Container-row">
        <div class="VersionHistory-mainCol">
          <div class="VersionHistory-header">
            <span class="VersionHistory-backLink">
              <a @click="goToRecord" @keyup.enter="goToRecord" tabindex="0">
                <i class="fa fa-arrow-left VersionHistory-back-icon" />{{ translatePhrase('Back') }}
              </a>
            </span>

            <span class="VersionHistory-headerTitle" v-if="displayData != null">
              {{ getItemLabel }}
            </span>

            <i
              class="fa fa-th-list icon icon--md sideColButton"
              role="button"
              @click="openSideCol()" />
          </div>

          <div class="VersionHistory-content" tabindex="-1">
            <template v-if="displayData != null">
              <tab-menu @go="setEditorFocus" :tabs="editorTabs" :active="focusedTab" />

              <entity-form
                v-for="tab in editorTabs"
                :editing-object="tab.id"
                :key="tab.id"
                :diff="currentVersionDiff"
                :is-active="focusedTab === tab.id"
                :form-data="displayData[tab.id]"
                :locked="true" />
            </template>
          </div>
        </div>

        <div class="VersionHistory-sideCol" :class="{ 'hidden-view': !showSideCol }">
          <div class="VersionHistory-header">
            {{ translatePhrase('Version history') }}
            <i class="fa fa-close icon icon--md sideColButton" role="button" @click="closeSideCol()" />
          </div>

          <VersionHistoryChangesets
            :change-sets="changeSets"
            :selected-version="selectedVersion"
            @version-selected="changeSelectedVersion"
          />
        </div>
      </div>
    </div>
  </focus-trap>
</template>

<style lang="less">
.VersionHistory {
  background-color: @bg-site;
  &-mainCol {
    height: 100vh;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    flex: 3 0 0;
  }
  &-sideCol {
    box-shadow: @fullscreen-panel-shadow;
    z-index: 2;
    height: 100vh;
    flex: 1 0 0;

    @media screen and (max-width: @screen-xs-max) {
      .full-view();
    }

    .full-view() {
      top: 0px;
      left: 0px;
      width: 100%;
      opacity: 1;
      height: 100vh;
      position: fixed;
      &.hidden-view {
        display: none;
      }
    }
  }
  &-backLink {
    font-weight: normal;
    a {
      color: inherit;
      white-space: nowrap;
    }
  }
  &-back-icon {
    margin-right: 0.3em;
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
    margin-left: 0.5em;
    margin-right: 0.5em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &-content {
    z-index: 0;
    padding: 1rem 3rem;
    overflow-y: scroll;
    flex-grow: 1;
  }
  &-changeSets {
    background-color: @white;
  }
  .Container-row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    padding: 0;
  }
  .sideColButton {
    @media screen and (min-width: @screen-xs-max) {
      display: none;
    }
  }
}

.ChangeSet {
  border-style: solid;
  border-width: 0px 0px 1px 0px;
  border-color: #ccc;
  &-dateContainer {
    flex-basis: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  &-changeSetContainer {
    display: flex;
    flex-wrap:wrap;
    border-style: solid;
    border-width: 0px 0px 0px 4px;
    border-color: transparent;
    padding: 0.75rem 0.75rem 0.75rem 1.5rem;
    &.selected {
      border-left-color: @brand-primary;
    }
  }
  &-currentVersion {
    flex-basis: 100%;
    font-size: 0.75em;
    text-transform: uppercase;
    &.selected {
      color: @brand-primary;
    }
  }
  &-date {
    flex: 1 0 auto;
    font-weight: 600;
    &.selected {
      color: @brand-primary;
    }
  }
  &-agent {
    flex-basis:100%;
    font-size: 0.9em;
  }
  &-tool {
    border: 1px solid @grey;
    border-radius: 2em;
    width: max-content;
    height: max-content;
    margin-right: 1em;
    margin-left: 1em;
    font-size: 0.75em;
    padding: 0 0.3em 0.1em 0.3em;
    flex: 0 0 auto;
  }
}
</style>
