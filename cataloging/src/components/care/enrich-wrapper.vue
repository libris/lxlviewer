<script>
import {mapActions, mapGetters} from 'vuex';
import {translatePhrase} from '@/utils/filters';

import MergeEntities from "@/components/care/merge-entities.vue";
import {isEmpty} from "lodash-es";
import * as StringUtil from "../../../../lxljs/string.js";
import * as HttpUtil from "@/utils/http.js";

export default {
  name: 'Enrich-wrapper',
  components: {
    'merge-entities': MergeEntities
  },
  data() {
    return {
      fetchedItems: [],
      fetchComplete: false,
      errors: {
        removed: [],
        other: [],
      },
      showModal: false,
    };
  },
  computed: {
    ...mapGetters([
      'enrichment',
      'settings',
      'inspector',
      'user',
      'userFlagged',
      'resources',
      'status',
      'directoryCare'
    ]),
    allFlagged() {
      return this.fetchedItems;
    },
    bothRecordsSelected() {
      return !isEmpty(this.directoryCare.mergeSourceId) && !isEmpty(this.directoryCare.mergeTargetId);
    },
  },
  watch: {
    userFlagged(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.fetchAllFlagged();
      }
    },
  },
  methods: {
    translatePhrase,
    ...mapActions([
      'setEnrichmentSource',
      'setEnrichmentTarget',
      'setEnrichmentChanges'
    ]),
    selectTarget() {
      const target = { 'mergeTargetId': this.inspector.data.record['@id'] + '#it' };
      this.$store.dispatch('setDirectoryCare', { ...this.directoryCare, ...target });
    },
    cancel() {
      this.resetEverything();
      this.close();
    },
    done() {
      this.close();
    },
    close() {
      const modal = this.inspector.status.enrichFromSelection;
      modal.open = false;
      this.$store.dispatch('setInspectorStatusValue', { property: 'enrichFromSelection', value: modal });
    },
    resetEverything() {
      this.$store.dispatch('setDirectoryCare', {
        ...this.directoryCare, ...{
          mergeSourceId: null,
          mergeTargetId: null
        }
      });
      this.setEnrichmentChanges(null);
      this.setEnrichmentTarget(null);
      this.setEnrichmentSource(null);
      this.$store.dispatch('flushChangeHistory');
    },
    fetchOne(item) {
      return new Promise((resolve, reject) => {
        const url = `${item['@id'].split('#')[0]}/data.jsonld?lens=card`;
        HttpUtil.getDocument(url).then((res) => {
          if (res.status === 200) {
            resolve(res.data);
          } else if (res.status === 410) {
            this.errors.removed.push(item);
            this.$store.dispatch('unmark', {tag: 'Flagged', documentId: item['@id']});
            resolve();
          } else {
            this.errors.other.push(item);
            resolve();
          }
        }, (error) => {
          reject(error);
        });
      });
    },
    fetchAllFlagged() {
      const promiseArray = [];
      this.userFlagged.forEach((item) => {
        promiseArray.push(this.fetchOne(item));
      });
      Promise.all(promiseArray)
        .then((result) => {
          this.fetchedItems = result;
          this.allDone();
        })
        .catch(() => {
          this.$store.dispatch(
            'pushNotification',
            {
              type: 'danger',
              message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)}`,
            },
          )
            .then(() => {
              this.allDone();
            });
        });
    },
    allDone() {
      this.$store.dispatch('removeLoadingIndicator', 'Loading')
        .then(() => {
          this.fetchComplete = true;
          if (this.errors.removed.length > 0) {
            this.showModal = true;
          }
          if (this.errors.other.length > 0) {
            this.$store.dispatch(
              'pushNotification',
              {
                type: 'danger',
                message: `${StringUtil.getUiPhraseByLang('The following resources could not be retrieved', this.user.settings.language, this.resources.i18n)}:
                ${this.errors.other.map((el) => el.label).join(', ')}`,
              },
            )
              .then(() => {
                this.errors.other = [];
              });
          }
        });
    },
  },
  mounted() {
    this.$nextTick(() => {
      //Select target
      this.selectTarget();
      this.fetchAllFlagged();
    });
  },
  unmounted() {
    this.resetEverything();
  },
};
</script>

<template>
  <div class="Enrich">
    <merge-entities v-if="allFlagged.length !== 0"
                    :flagged="allFlagged"
                    :enrich-step=true
                    :target-locked=true
                    source-picker-label="sender"
                    source-top-label="from"
                    target-picker-label="receiver"
                    target-top-label="to"
    >
    </merge-entities>
    <div class="Enrich-infoBox" v-if="allFlagged.length === 0">
      <div class="iconCircle"><i class="fa fa-fw fa-flag" /></div>
      <div class="Merge-description">
        För att kunna berika behöver du först välja en entitet att berika från genom att flagga den.
      </div>
    </div>

  <div class="Enrich-dialog is-floating">
      <button v-if="allFlagged.length !== 0" class="btn btn--md btn-info" @click="cancel" @keyup.enter="cancel">{{ translatePhrase('Cancel') }}</button>
      <button v-if="allFlagged.length !== 0" class="btn btn--md btn-primary" @click="done" @keyup.enter="done">{{ translatePhrase('Done') }}</button>
      <button v-if="allFlagged.length === 0" class="btn btn--md btn-primary" @click="cancel" @keyup.enter="cancel">{{ translatePhrase('Back') }}</button>
  </div>
  </div>
</template>

<style lang="less">
.Enrich {
  width: 100%;
  height: 70vh;

  padding: 2rem 2rem 0 2rem;
  margin-bottom: 5em;

  &-dialog {
    background-color: @neutral-color;
    margin: 0 -1em;
    padding: 1.5rem 2.5rem;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    border: solid @grey-light;
    border-width: 1px 0px 0px 0px;
    button {
      margin-left: 1rem;
    }
    &.is-floating {
      position: absolute;
      bottom: -5rem;
      left: 0;
      right: 0;
      margin: 0;
    }
  }

  &-stepSelection {
    gap: 20px;

    &.underline {
      border-bottom: 1px solid @grey-lighter;
      margin-bottom: 1em;
    }

    padding-bottom: 1em;
    padding-top: 0.5em;
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
    //background-color: @white;
    //border: 1px solid @grey-lighter;
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
