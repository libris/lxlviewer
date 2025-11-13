<script>
import {mapActions, mapGetters} from 'vuex';
import {translatePhrase} from '@/utils/filters';

import MergeEntities from "@/components/care/merge-entities.vue";
import {isEmpty} from "lodash-es";

export default {
  name: 'Merge-wrapper',
  components: {
    'merge-entities': MergeEntities
  },
  props: {
    flagged: {
      type: Array,
    },
  },
  data() {
    return {
      enrichStep: true,
      editStep: false,
      mismatchingTypes: false,
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
    sideBySide() {
      return this.inspector.status.sideBySide;
    },
    stepNumber() {
      return this.enrichStep ? 1 : 2;
    },
    bothRecordsSelected() {
      return !isEmpty(this.directoryCare.mergeSourceId) && !isEmpty(this.directoryCare.mergeTargetId);
    },
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
    restart() {
      this.$router.go(0);
      this.resetEverything();
    },
    setMismatchingTypes(val) {
      this.mismatchingTypes = val;
    },
    resetEverything() {
      this.$store.dispatch('setInspectorStatusValue', {property: 'sideBySide', value: false});
      this.$store.dispatch('setDirectoryCare', {
        ...this.directoryCare, ...{
          mergeSourceId: null,
          mergeTargetId: null
        }
      });
      this.$store.dispatch('setInspectorData', {});
      this.setEnrichmentChanges(null);
      this.setEnrichmentTarget(null);
      this.setEnrichmentSource(null);
      this.$store.dispatch('flushChangeHistory');
    },
    goToEditStep() {
      this.resetCachedChanges();
      this.$store.dispatch('setInspectorStatusValue', {
        property: 'editing',
        value: true,
      });
      this.$store.dispatch('setInspectorStatusValue', {property: 'sideBySide', value: false});
      this.enrichStep = false;
      this.editStep = true;
    },
    goToEnrichStep() {
      this.$store.dispatch('setInspectorStatusValue', {property: 'sideBySide', value: true});
      this.enrichStep = true;
      this.editStep = false;
    },
  },
  mounted() {
    this.$store.dispatch('setInspectorStatusValue', {property: 'focus', value: 'mainEntity'});
    this.$store.dispatch('setInspectorStatusValue', {property: 'sideBySide', value: true});
  },
  unmounted() {
    this.resetEverything();
  },
  };
</script>

<template>
  <div class="Merge">
    <div v-show="this.flagged.length !== 0">
    <div class="Merge-stepSelection underline"
         :class="{'col-md-12': sideBySide, 'col-md-11': !status.panelOpen && !sideBySide,
                  'col-md-7': status.panelOpen }">
      <span>{{ translatePhrase('Step') }} {{ this.stepNumber }} {{ translatePhrase('of') }} 2 </span>
      <div v-if="bothRecordsSelected">
        <button class="btn--as-link" v-if="this.editStep" @click="goToEnrichStep" @keyup.enter="goToEnrichStep">{{ translatePhrase('Previous') }}</button>
        <button class="btn--as-link" v-if="this.enrichStep && !mismatchingTypes"
                @click="goToEditStep"
                @keyup.enter="goToEditStep">
          {{ translatePhrase('Next') }}
        </button>
      </div>
    </div>
    <merge-entities :flagged="flagged"
                    :enrich-step="this.enrichStep"
                    :edit-step="this.editStep"
                    source-picker-label="entity to remove"
                    source-top-label="Remove"
                    target-picker-label="entity to keep"
                    target-top-label="Keep"
                    @cancel="restart"
                    @mismatchingTypes="setMismatchingTypes"
    >
    </merge-entities>
    <div v-if="bothRecordsSelected" class="Merge-stepSelection"
         :class="{'col-md-12': !status.panelOpen && sideBySide, 'col-md-11': !status.panelOpen && !sideBySide,
                  'col-md-7': status.panelOpen }">
      <span>{{ translatePhrase('Step') }} {{ this.stepNumber }} {{ translatePhrase('of') }} 2 </span>
      <div>
        <button class="btn--as-link" v-if="this.editStep" @click="goToEnrichStep" @keyup.enter="goToEnrichStep">{{ translatePhrase('Previous') }}</button>
        <button class="btn--as-link" v-if="this.enrichStep && !mismatchingTypes"
                @click="goToEditStep"
                @keyup.enter="goToEditStep">
          {{ translatePhrase('Next') }}
        </button>
      </div>
    </div>
  </div>
    <div class="Merge-infoBox" v-if="flagged.length === 0 && !mismatchingTypes">
      <div class="iconCircle"><i class="fa fa-fw fa-flag" /></div>
      <div class="Merge-description">
        {{ translatePhrase('To be able to merge entities, you first need to select those entities you want to merge by flagging them.') }}
      </div>
    </div>
  </div>
</template>

<style lang="less">
.Merge {
  padding: 0;
  height: 40vh;

  &-stepSelection {
    gap: 20px;

    &.underline {
      border-bottom: 1px solid @grey-lighter;
      margin-bottom: 1em;
    }

    padding-bottom: 10px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    margin: 0 0 0.5em 0;
  }

  &-description {
    padding-left: 1rem;
  }

  &-infoBox {
    display: flex;
    align-items: center;
    margin-bottom: 1em;
    background-color: @white;
    border: 1px solid @grey-lighter;
    padding: 2rem;
  }

  .iconCircle {
    border: 1px solid @grey-lighter;
    border-radius: 1em;
    width: 2em;
    height: 2em;
    line-height: 2em;
    text-align: center;
    color: @brand-primary;
  }
}
</style>
