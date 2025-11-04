<script>
import {mapActions, mapGetters} from 'vuex';
import {asFnurgelLink, labelByLang, translatePhrase} from '@/utils/filters';

import MergeEntities from "@/components/care/merge-entities.vue";
import {cloneDeep, get, isEmpty} from "lodash-es";
import * as StringUtil from "../../../../lxljs/string.js";
import * as HttpUtil from "@/utils/http.js";
import * as DataUtil from "@/utils/data.js";

export default {
  name: 'Enrich-wrapper',
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
      recordLoaded: false,
      recordSuccessfullySaved: false,
      targetETag: null,
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
        setEtag(val) {
          this.targetETag = val;
        },
        resetCachedChanges() {
          this.setEnrichmentChanges(null);
        },
        cancel() {
          this.resetEverything();
        },
        resetEverything() {
          this.$store.dispatch('setDirectoryCare', { ...this.directoryCare, ...{ mergeSourceId: null, mergeTargetId: null } });
          this.setEnrichmentChanges(null);
          this.setEnrichmentTarget(null);
          this.setEnrichmentSource(null);
          this.$store.dispatch('flushChangeHistory');
        },
        save() {
          this.resetCachedChanges();
          try {
            const target = DataUtil.getMergedItems(
              DataUtil.normalizeBeforeSave(cloneDeep(this.inspector.data.record)),
              DataUtil.normalizeBeforeSave(this.inspector.data.mainEntity),
              DataUtil.normalizeBeforeSave(this.inspector.data.work),
            );
            this.saveTargetRecord(target).then(() => {
                if (this.recordSuccessfullySaved) {
                  this.$store.dispatch('setInspectorStatusValue', {property: 'sideBySide', value: false});
                  this.$router.push({ path: asFnurgelLink(this.inspector.data.record['@id']) });
                  this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
                }
              }
            );
          } catch (e) {
            const errorBase = StringUtil.getUiPhraseByLang('Save failed', this.user.settings.language, this.resources.i18n);
            const errorMessage = `${StringUtil.getUiPhraseByLang(e.message, this.user.settings.language, this.resources.i18n)}`;
            this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
            this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
            return;
          }
        },
        async saveTargetRecord(obj) {
          try {
            await this.update(this.inspector.data.record['@id'], obj, this.targetETag);
          } catch (error) {
            console.error(error);
            this.$store.dispatch('pushNotification', {
              type: 'danger',
              message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)} - ${error}`,
            });
            this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
          }
          this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: true });
        },
        update(url, obj, ETag) {
          return this.doSaveTarget(HttpUtil.put, obj, { url, ETag });
        },
        doSaveTarget(requestMethod, obj, opts) {
          return requestMethod({
            url: opts.url,
            ETag: opts.ETag,
            activeSigel: this.user.settings.activeSigel,
            token: this.user.token,
          }, obj).then(() => {
            const msgKey = 'was saved';
            const type = get(obj, ['@graph', 1, '@type'], '');

            setTimeout(() => {
              this.$store.dispatch('pushNotification', {
                type: 'success',
                message: `${labelByLang(type)} ${StringUtil.getUiPhraseByLang(msgKey, this.user.settings.language, this.resources.i18n)}!`,
              });
            }, 10);
            this.recordSuccessfullySaved = true;
            console.log('Saved record with id:', this.targetId);
            this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
          }, (error) => {
            this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
            const errorBase = StringUtil.getUiPhraseByLang('Save failed', this.user.settings.language, this.resources.i18n);
            let errorMessage = '';
            switch (error.status) {
              case 412:
                errorMessage = `${StringUtil.getUiPhraseByLang('The resource has been modified by another user', this.user.settings.language, this.resources.i18n)}`;
                this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
                break;
              case 409:
                errorMessage = `${StringUtil.getUiPhraseByLang('The resource already exists', this.user.settings.language, this.resources.i18n)}`;
                this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
                break;
              case 401:
                localStorage.removeItem('lastPath');
                errorMessage = `${StringUtil.getUiPhraseByLang('Your login has expired', this.user.settings.language, this.resources.i18n)}`;
                this.$store.dispatch('pushNotification', { type: 'danger',
                  message: `${errorBase}. ${errorMessage}.`,
                  sticky: true,
                  link: {
                    to: this.$store.getters.oauth2Client.token.getUri(),
                    title: `${StringUtil.getUiPhraseByLang('Log in', this.user.settings.language, this.resources.i18n)}`,
                    newTab: true,
                    external: true,
                  } });
                break;
              default:
                console.error(error);
                errorMessage = `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)} - ${error.status}: ${StringUtil.getUiPhraseByLang(error.statusText, this.user.settings.language, this.resources.i18n)}`;
                this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
            }
          });
        },
      },
  mounted() {
    this.$nextTick(() => {
      this.$store.dispatch('setInspectorStatusValue', {property: 'focus', value: 'mainEntity'});
      this.$store.dispatch('setInspectorStatusValue', {property: 'sideBySide', value: true});
    });
  },
  unmounted() {
    this.resetEverything();
  },
  };
</script>

<template>
  <div class="Enrich">
    <div class="Enrich-stepSelection underline">
      <div v-if="bothRecordsSelected">
        <button class="Enrich-button btn btn--md btn-light" @click="cancel" @keyup.enter="cancel">{{ translatePhrase('Cancel') }}</button>
        <button class="Enrich-button btn btn--md btn-primary" @click="save" @keyup.enter="save">{{ translatePhrase('Save receiver') }}</button>
      </div>
    </div>
    <merge-entities :flagged="flagged"
                    :enrich-step=true
                    source-picker-label="sender"
                    source-top-label="from"
                    target-picker-label="receiver"
                    target-top-label="to"
    @etag="setEtag">
    </merge-entities>
    <div class="Enrich-stepSelection">
      <div v-if="bothRecordsSelected">
        <button class="Enrich-button btn btn--md btn-light" @click="cancel" @keyup.enter="cancel">{{ translatePhrase('Cancel') }}</button>
        <button class="Enrich-button btn btn--md btn-primary" @click="save" @keyup.enter="save">{{ translatePhrase('Save receiver') }}</button>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.Enrich {
  padding:0;
  &-stepSelection {
    gap: 20px;
    &.underline {
      border-bottom:  1px solid @grey-lighter;
      margin-bottom: 1em;
    }
    padding-bottom: 1em;
    padding-top: 0.5em;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    margin: 0 0 0.5em 0;
  }
  &-button {
    margin-left: 1.5rem;
  }
}
</style>
