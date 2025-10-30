<script>
import {mapActions, mapGetters} from 'vuex';
import {translatePhrase} from '@/utils/filters';

import MergeEntities from "@/components/care/merge-entities.vue";
import {isEmpty} from "lodash-es";

export default {
  name: 'MergeRecordsContainer',

  components: {
    'merge-entities': MergeEntities
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
      'status',
      'directoryCare'
    ]),
    stepNumber() {
      return this.enrichStep ? 1 : 2;
    },
    bothRecordsSelected() {
      return !isEmpty(this.directoryCare.mergeSourceId) && !isEmpty(this.directoryCare.mergeTargetId);
    },
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
          this.editStep = true;
        },
        goToEnrichStep() {
          this.enrichStep = true;
          this.editStep = false;
        },
      },
  mounted() {
    this.$nextTick(() => {
      this.$store.dispatch('flushChangeHistory');
      this.setEnrichmentChanges(null);
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
    <div class="MergeRecordsContainer-stepSelection">
      <span>{{ translatePhrase('Step') }} {{ this.stepNumber }} {{ translatePhrase('of') }} 2 </span>
      <div v-if="bothRecordsSelected">
        <button class="btn--as-link" v-if="this.editStep" @click="goToEnrichStep" @keyup.enter="goToEnrichStep">{{ translatePhrase('Previous') }}</button>
        <button class="btn--as-link" v-if="this.enrichStep" @click="goToEditStep" @keyup.enter="goToEditStep">{{ translatePhrase('Next') }}</button>
      </div>
    </div>
  <merge-entities :flagged="flagged" :enrich-step="this.enrichStep" :edit-step="this.editStep"></merge-entities>
    <div v-if="bothRecordsSelected" class="MergeRecordsContainer-stepSelection">
      <span>{{ translatePhrase('Step') }} {{ this.stepNumber }} {{ translatePhrase('of') }} 2 </span>
      <div>
        <button class="btn--as-link" v-if="this.editStep" @click="goToEnrichStep" @keyup.enter="goToEnrichStep">{{ translatePhrase('Previous') }}</button>
        <button class="btn--as-link" v-if="this.enrichStep" @click="goToEditStep" @keyup.enter="goToEditStep">{{ translatePhrase('Next') }}</button>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.MergeRecordsContainer {

  &-stepSelection {
    gap: 20px;
    border-bottom:  1px solid @grey-lighter;
    padding-bottom: 10px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    margin: 0 0 0.5em 0;
  }


}
</style>
