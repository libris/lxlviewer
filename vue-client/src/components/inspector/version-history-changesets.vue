<script>
/*
  Changeset list
*/
import { mapGetters } from 'vuex';
import LensMixin from '@/components/mixins/lens-mixin';
import SummaryNode from '@/components/shared/summary-node.vue';

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
      }
    },
  },
  methods: {
    selectVersion(val) {
      this.$emit('version-selected', val);
    }
  },
  components: {
    SummaryNode,
  },
  mounted() {
  },
};
</script>

<template>
  <div class="VersionHistory-changeSets" v-if="changeSetsReversed">
    <div class="ChangeSet" v-for="(changeSet, index) in changeSetsReversed" :key="changeSet.date" @click="selectVersion(index)" :class="{ 'selected': selectedVersion == index }">
      <div class="ChangeSet-changeSetContainer" :class="{ 'selected': selectedVersion == index }">
        <span class="ChangeSet-currentVersion" :class="{ 'selected': selectedVersion == index }" v-if="index == 0">Aktuell version</span>
        <span class="ChangeSet-date" :class="{ 'selected': selectedVersion == index }">{{ $moment(changeSet.date).format('lll') }}</span>
        <span class="ChangeSet-author" :class="{ 'selected': selectedVersion == index }">
          <SummaryNode :is-static="true" :hover-links="false" v-if="changeSet.agent" :item="changeSet.agent" :is-last="true" :field-key="'agent'"/>
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
