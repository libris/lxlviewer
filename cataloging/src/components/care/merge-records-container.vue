<script>
import { mapGetters, mapActions } from 'vuex';
import {capitalize, labelByLang, translatePhrase} from '@/utils/filters';

import MergeRecords from "@/components/care/merge-records.vue";
import * as RecordUtil from "@/utils/record.js";
import * as StringUtil from "../../../../lxljs/string.js";
import * as LxlDataUtil from "../../../../lxljs/data.js";
import {cloneDeep, each, unset} from "lodash-es";
import * as VocabUtil from "../../../../lxljs/vocab.js";
import {getChangeList} from "@/utils/enrich.js";
import * as DataUtil from "@/utils/data.js";

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
          closeMergeViewModal() {
          this.$store.dispatch('setInspectorData', this.inspector.originalData);
          this.$store.dispatch('flushChangeHistory');
          this.setEnrichmentChanges(null);
        },
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
        applyFromSource() {
          this.$store.dispatch('setInspectorData', this.inspector.originalData);
          this.$store.dispatch('flushChangeHistory');
          this.removeEnrichedHighlight();
          let source = cloneDeep(this.enrichment.data.source);
          each(this.settings.keysToClear.duplication, (property) => {
            unset(source, property);
          });
          this.applyFieldsFromSource(source);
        },
        applyFieldsFromSource(source) {
          const baseRecordType = this.inspector.data.mainEntity['@type'];
          const tempRecordType = source.mainEntity['@type'];
          const matching = (
            VocabUtil.isSubClassOf(tempRecordType, baseRecordType, this.resources.vocab, this.resources.context)
            || VocabUtil.isSubClassOf(baseRecordType, tempRecordType, this.resources.vocab, this.resources.context)
          );
          if (matching === false) {
            const baseRecordLabel = StringUtil.getLabelByLang(baseRecordType, this.user.settings.language, this.resources);
            const tempRecordLabel = StringUtil.getLabelByLang(tempRecordType, this.user.settings.language, this.resources);
            const errorBase = `${StringUtil.getUiPhraseByLang('The types do not match', this.user.settings.language, this.resources.i18n)}`;
            const errorMessage = `"${tempRecordLabel}" ${StringUtil.getUiPhraseByLang('is not compatible with', this.user.settings.language, this.resources.i18n)} "${baseRecordLabel}"`;
            this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}! ${errorMessage}` });
            return;
          }

          const baseRecordData = cloneDeep(this.inspector.data);

          // This part checks if the template should include the work or not (to not overwrite a link)
          if (baseRecordData.mainEntity.hasOwnProperty('instanceOf')) {
            const baseRecordWork = baseRecordData.mainEntity.instanceOf;
            if (Object.keys(baseRecordWork).length === 1 && baseRecordWork.hasOwnProperty('@id')) {
              delete source.mainEntity.instanceOf;
            }
          }
          let changeList;
          if (!this.enrichment.data.changes) {
            changeList = [
              ...getChangeList(source, baseRecordData, ['mainEntity'], ['mainEntity'], this.resources.context),
              ...getChangeList(source, baseRecordData, ['record'], ['record'], this.resources.context)
            ];

            this.setEnrichmentChanges(changeList)
            changeList.forEach((change) => {
              DataUtil.fetchMissingLinkedToQuoted(change.value, this.$store);
            });
          } else {
            changeList = this.enrichment.data.changes;
          }

          const changesToBeApplied = changeList.filter(a =>
            this.inspector.status.selected.some(b => a.path.startsWith(b.path))
          );

          if (changesToBeApplied.length !== 0) {
            this.$store.dispatch('updateInspectorData', {
              changeList: changesToBeApplied,
              addToHistory: false,
            });
            this.$store.dispatch('setInspectorStatusValue', {
              property: 'enriched',
              value: changesToBeApplied,
            });
          }
        },

        removeEnrichedHighlight() {
          if (this.inspector.status.enriched.length) {
            this.$store.dispatch('setInspectorStatusValue', {
              property: 'enriched',
              value: [],
            });
          }
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
