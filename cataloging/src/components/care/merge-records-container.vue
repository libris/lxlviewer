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
  data() {
    return {
      recordLoaded: false,
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
        fetchId(id = 'bmlrfn0683955zqc', fetchingSource=false) {
          if (id !== null) {
            console.log('ASDNKAJDSKJANSDKJANDS')
            const fixedId = RecordUtil.extractFnurgel(id);
            const fetchUrl = `${this.settings.apiPath}/${fixedId}/data.jsonld`;
            fetch(fetchUrl).then((response) => {
              if (response.status === 200) {
                return response.json();
              } if (response.status === 404 || response.status === 410) {
                this.$store.dispatch('pushNotification', {
                  type: 'danger',
                  message: `${StringUtil.getUiPhraseByLang('The record was not found', this.user.settings.language, this.resources.i18n)}. ${response.status} ${response.statusText}`,
                });
              } else {
                this.$store.dispatch('pushNotification', {
                  type: 'danger',
                  message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)}. ${response.status} ${response.statusText}`,
                });
              }
              return false;
            }, (error) => {
              this.$store.dispatch('pushNotification', {
                type: 'danger',
                message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)}. ${error}`,
              });
            }).then((result) => {
              if (typeof result !== 'undefined') {
                const data = LxlDataUtil.splitJson(result);
                if (fetchingSource) {
                  this.setEnrichmentSource(data);
                  DataUtil.fetchMissingLinkedToQuoted(data, this.$store);
                } else {
                  console.log('HEJ')
                  this.$store.dispatch('setInspectorData', data);
                  this.setEnrichmentTarget(data);
                  this.$store.dispatch('removeLoadingIndicator', 'Loading document');
                  this.removeEnrichedHighlight();
                  this.recordLoaded = true;
                  this.$store.dispatch('setOriginalData', data);
                  DataUtil.fetchMissingLinkedToQuoted(data, this.$store);
                }
              }
            });
          } else {
            throw new Error('Failed to prepare data for detailed enrichment.');
          }
        },
      },
  mounted() {
    this.$nextTick(() => {
      this.$store.dispatch('pushLoadingIndicator', 'Loading document');
      this.$store.dispatch('flushChangeHistory');
      this.$store.dispatch('flushExtractItemsOnSave');
      this.$store.dispatch('setInspectorStatusValue', {property: 'focus', value: 'mainEntity'});
      const sourceId = 'bmlrfn0683955zqc';
      const targetId = 'qb343vrwn13cwxj7';
      this.fetchId(sourceId, true);
      this.fetchId(targetId);
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
  <merge-records></merge-records>
  </div>
</template>

<style lang="less">
.MergeRecordsContainer {

}
</style>
