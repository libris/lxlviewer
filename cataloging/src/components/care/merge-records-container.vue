<script>
import {mapActions, mapGetters} from 'vuex';
import {translatePhrase} from '@/utils/filters';

import MergeRecords from "@/components/care/merge-records.vue";

export default {
  name: 'MergeRecordsContainer',

  components: {
    MergeRecords,
  },
  props: {
    //TODO: not only instances
    flagged: {
      type: Array,
    },
  },
  data() {
    return {
      recordLoaded: false,
      enrichStep: true,
      editStep: false,
      mergeStep: false,
    };
  },
  computed: {
    ...mapGetters([
      'enrichment',
      'settings',
      'inspector',
      'user',
      'resources',
      'status'
    ]),
  },
  watch: {
    'inspector.event'(val) {
        if (val.name === 'apply-source' && this.recordLoaded) {
          this.applyFromSource();
        }
      }
  },
      methods: {
        translatePhrase,
      ...mapActions([
          'setEnrichmentSource',
          'setEnrichmentTarget',
          'setEnrichmentChanges'
        ]),
        resetCachedChanges() {
          this.setEnrichmentChanges(null);
        },
        goToEditStep() {
          this.resetCachedChanges();
          this.$store.dispatch('setInspectorStatusValue', {
            property: 'editing',
            value: true,
          });
          this.enrichStep = false;
          this.mergeStep = false;
          this.editStep = true;
        },
        goToEnrichStep() {
          this.enrichStep = true;
          this.mergeStep = false;
          this.editStep = false;
        },
        goToMergeStep() {
          this.enrichStep = false;
          this.mergeStep = true;
          this.editStep = false;
        },
      },
  mounted() {
    this.$nextTick(() => {
      this.$store.dispatch('flushChangeHistory');
      this.$store.dispatch('flushExtractItemsOnSave');
      this.$store.dispatch('setInspectorStatusValue', {property: 'focus', value: 'mainEntity'});
      this.$store.dispatch('setInspectorStatusValue', {property: 'mergeView', value: true});
    });
  },
  unmounted() {
    this.$store.dispatch('setInspectorStatusValue', {property: 'mergeView', value: false});
    this.setEnrichmentChanges(null);
    this.$store.dispatch('flushChangeHistory');
  },
  };
</script>

<template>
  <div class="MergeRecordsContainer">
    <button class="btn btn--md btn-selectable" :class="{ 'selected' : this.enrichStep }" @click="goToEnrichStep" @keyup.enter="goToEnrichStep">1. Berika</button>
    <button class="btn btn--md btn-selectable" :class="{ 'selected' : this.editStep }" @click="goToEditStep" @keyup.enter="goToEditStep">2. Redigera</button>
    <button class="btn btn--md btn-selectable" :class="{ 'selected' : this.mergeStep }" @click="goToMergeStep" @keyup.enter="goToMergeStep">3. Slå ihop</button>
  <merge-records :flagged="flagged" :enrich-step="this.enrichStep" :edit-step="this.editStep" :merge-step="this.mergeStep"></merge-records>
  </div>
</template>

<style lang="less">
.MergeRecordsContainer {
  .btn-selectable {
    border-radius: 0;
    color: lighten(@black, 30%);
    background-color: darken(@white, 5%);
    &:focus {
      color: lighten(@black, 15%);
      background-color: darken(@white, 5%);
    }
    &:hover {
      color: lighten(@black, 10%);
      //background-color: darken(@white, 10%);
      text-decoration: underline;

    }
  }
  .selected {
    color: lighten(@black, 10%);
    text-decoration: underline;
    background-color: darken(@white, 8%);
  }

}
</style>
