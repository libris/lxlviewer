<script>
/*
  Changeset list
*/
import { mapGetters } from 'vuex';
import { Menu } from 'floating-vue';
import LensMixin from '@/components/mixins/lens-mixin.vue';
import SummaryNode from '@/components/shared/summary-node.vue';
import { translatePhrase } from '@/utils/filters';
import { formatDateTime } from '@/utils/datetime';

export default {
  mixins: [LensMixin],
  props: {
    changeSets: {
      type: Array,
      default: () => [],
    },
    selectedVersion: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      fetchedVersionData: null,
      focusedTab: 'mainEntity',
      inspectingPath: '',
    };
  },
  emits: ['version-selected'],
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    changeSetsReversed() {
      if (this.changeSets != null) {
        return [...this.changeSets].reverse();
      }
      return null;
    },
    selectedChangeSet() {
      return this.changeSetsReversed[this.selectedVersion];
    },
  },
  watch: {
    'inspector.event'(val) {
      if (val.name === 'field-label-clicked') {
        this.inspectingPath = val.value;
        this.$refs.changeSet[this.selectedVersion].scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'start' });
      }
    },
  },
  methods: {
    translatePhrase,
    formatDateTime,
    isGlobalChanges(changeSet) {
      return changeSet.agent['@id'].includes('sys/globalchanges');
    },
    selectVersion(val) {
      this.$emit('version-selected', val);
    },
  },
  components: {
    Menu,
    SummaryNode,
  },
  mounted() {
  },
};
</script>

<template>
  <div class="VersionHistory-changeSets" v-if="changeSetsReversed">
    <div
      class="ChangeSet"
      v-for="(changeSet, index) in changeSetsReversed"
      ref="changeSet"
      :key="changeSet.date"
      @click="selectVersion(index)"
      @keyup.enter="selectVersion(index)"
      :class="{ selected: selectedVersion == index }"
      tabindex=0>
      <div class="ChangeSet-changeSetContainer" :class="{ selected: selectedVersion == index }">
        <span
          class="ChangeSet-currentVersion"
          :class="{ selected: selectedVersion == index }"
          v-if="index == 0">{{ translatePhrase("Current version")}}</span>
        <div class="ChangeSet-dateContainer">
          <span class="ChangeSet-date" :class="{ selected: selectedVersion == index }">{{ formatDateTime(changeSet.date) }}</span>
          <span class="ChangeSet-tool" v-if="changeSet.tool['@id'] !== 'https://id.kb.se/generator/crud'">{{ translatePhrase("by machine") }}</span>
        </div>
        <span class="ChangeSet-author" :class="{ selected: selectedVersion == index }">
          <SummaryNode
            :is-static="true"
            :hover-links="false"
            :handle-overflow="false"
            v-if="changeSet.agent && !isGlobalChanges(changeSet)"
            :item="changeSet.agent"
            :is-last="true"
            :field-key="'agent'" />
          <span v-if="isGlobalChanges(changeSet)">
            <Menu placement="bottom-start" :delay="{ show: 200, hide: 0 }" :popperHideTriggers="['hover']">
              {{ translatePhrase('Libris global changes') }}
              <template #popper>
                <span>{{changeSet.agent['@id']}}</span>
              </template>
            </Menu>
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="less">

.VersionHistory-changeSets {
  overflow-y: scroll;
  flex-grow: 1;
  height: 100%;
}

</style>
