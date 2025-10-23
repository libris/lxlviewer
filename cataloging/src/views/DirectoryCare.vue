<script>
import { mapGetters } from 'vuex';
import { filter } from 'lodash-es';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import * as HttpUtil from '@/utils/http';
import { translatePhrase } from '@/utils/filters';
import TabMenu from '@/components/shared/tab-menu.vue';
import HoldingMover from '@/components/care/holding-mover.vue';
import CreateMessage from '@/components/care/create-message.vue';
import CreateBulkChange from '@/components/care/create-bulk-change.vue';
import BulkChanges from '@/components/care/bulk-changes.vue';
import ModalComponent from '@/components/shared/modal-component.vue';
import AdminNotices from './AdminNotices.vue';
import MergeRecordsContainer from "@/components/care/merge-records-container.vue";

export default {
  name: 'DirectoryCare',
  components: {
    AdminNotices,
    'tab-menu': TabMenu,
    'holding-mover': HoldingMover,
    'modal-component': ModalComponent,
    'create-message': CreateMessage,
    'create-bulk-change': CreateBulkChange,
    'bulk-changes': BulkChanges,
    'merge-records-container': MergeRecordsContainer,
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
      'settings',
      'userFlagged',
      'user',
      'resources',
      'templates',
    ]),
    flaggedInstances() {
      return filter(this.fetchedItems, (o) => VocabUtil.getRecordType(o['@type'], this.resources.vocab, this.resources.context) === 'Instance');
    },
    tabs() {
      const tabs = [
        { id: 'changes', text: 'CXZ messages' },
        { id: 'message', text: 'Create message' },
        { id: 'holdings', text: 'Move holdings' },
        { id: 'merge', text: 'Merge entities' },
        // { 'id': 'remove', 'text': 'Batch remove' },
      ];
      if (this.userIsAllowedToBulkChange) {
        tabs.push({ id: 'bulkchanges', text: 'Create bulk change' })
      }
      return tabs;
    },
    userIsAllowedToBulkChange() {
      if (this.user.isLoggedIn === false) {
        return false;
      }
      return this.user.settings.activeSigel === 'SEK';
    },
    isBulkChangeOne() {
      return (this.$route.params.tool === 'bulkchanges' || this.$route.name === 'Bulkchanges') && this.$route.params.fnurgel;
    }
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
    switchTool(id) {
      const goTo = `/directory-care/${id}`;
      if (!this.$route.fullPath.includes(goTo)) {
        this.$router.push({ path: goTo });
      }
    },
    fetchOne(item) {
      return new Promise((resolve, reject) => {
        const url = `${item['@id'].split('#')[0]}/data.jsonld?lens=card`;
        HttpUtil.getDocument(url).then((res) => {
          if (res.status === 200) {
            resolve(res.data);
          } else if (res.status === 410) {
            this.errors.removed.push(item);
            this.$store.dispatch('unmark', { tag: 'Flagged', documentId: item['@id'] });
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
    closeModal() {
      this.showModal = false;
      this.errors.removed = [];
    },
  },
  mounted() {
    this.$store.dispatch('pushLoadingIndicator', 'Loading');
    this.fetchAllFlagged();
  },
};
</script>

<template>
  <div class="DirectoryCare">
    <div v-if="fetchComplete">
      <tab-menu @go="switchTool" :tabs="tabs" :active="$route.params.tool" v-if="!isBulkChangeOne"/>
      <admin-notices v-if="$route.params.tool === 'changes'" />
      <create-message v-if="$route.params.tool === 'message'" />
      <holding-mover v-if="$route.params.tool === 'holdings'" :flaggedInstances="flaggedInstances" />
      <create-bulk-change v-if="($route.params.tool === 'bulkchanges' || $route.name === 'Bulkchanges') && this.userIsAllowedToBulkChange && !$route.params.fnurgel" />
      <bulk-changes v-if="isBulkChangeOne && this.userIsAllowedToBulkChange" :fnurgel="$route.params.fnurgel" />
      <div v-if="!this.userIsAllowedToBulkChange && ($route.params.tool === 'bulkchanges' || $route.name === 'Bulkchanges')">
        <h1></h1>
        {{ translatePhrase("To see bulk changes you need to switch to a sigel with access.") }}
      </div>
      <merge-records-container :flagged="flaggedInstances" v-if="$route.params.tool === 'merge'"></merge-records-container>
      <modal-component
        v-if="showModal"
        title="Directory care list adjusted"
        modal-type="info"
        @close="closeModal">
        <template #modal-body>
          <div class="DirectoryCare-modalBody">
            <p>
              {{ `${translatePhrase('The following resources could not be retrieved')}
              ${translatePhrase('because they no longer exist. They have been removed from the directory care list')}` }}:
            </p>
            <ul>
              <li v-for="error in errors.removed" :key="error['@id']">
                {{error.label}}
              </li>
            </ul>
            <div class="DirectoryCare-modalBtnContainer">
              <button class="btn btn-primary btn--md" @click="closeModal">OK</button>
            </div>
          </div>
        </template>
      </modal-component>
    </div>
  </div>
</template>

<style lang="less">
.DirectoryCare {
  margin-bottom: 2em;
  &-modalBody {
    width: 100%;
    padding: 20px;
  }

  &-modalBtnContainer {
    margin-top: 20px;
  }
}

</style>
