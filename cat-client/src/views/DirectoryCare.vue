<script>
import { mapGetters } from 'vuex';
import { filter } from 'lodash-es';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import * as HttpUtil from '@/utils/http';
import TabMenu from '@/components/shared/tab-menu';
import HoldingMover from '@/components/care/holding-mover';
import ModalComponent from '@/components/shared/modal-component';

export default {
  name: 'DirectoryCare',
  components: {
    'tab-menu': TabMenu,
    'holding-mover': HoldingMover,
    'modal-component': ModalComponent,
  },
  data() {
    return {
      fetchedItems: [],
      fetchComplete: false,
      errors: {
        removed: [],
        other: [],
      },
      tabs: [
        { id: 'holdings', text: 'Move holdings' },
        // { 'id': 'merge', 'text': 'Merge records' }, 
        // { 'id': 'remove', 'text': 'Batch remove' }, 
      ],
      showModal: false,
    };
  },
  computed: {
    ...mapGetters([
      'settings',
      'userFlagged',
      'user',
      'resources',
    ]),
    flaggedInstances() {
      return filter(this.fetchedItems, o => VocabUtil.getRecordType(o['@type'], this.resources.vocab, this.resources.context) === 'Instance');
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
    switchTool(id) {
      this.$router.push({ path: `/directory-care/${id}` });
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
          this.$store.dispatch('pushNotification',
            { 
              type: 'danger',
              message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)}`, 
            })
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
            this.$store.dispatch('pushNotification',
              {
                type: 'danger',
                message: `${StringUtil.getUiPhraseByLang('The following resources could not be retrieved', this.user.settings.language, this.resources.i18n)}: 
                ${this.errors.other.map(el => el.label).join(', ')}`, 
              })
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
      <tab-menu @go="switchTool" :tabs="tabs" :active="$route.params.tool"></tab-menu>
      <holding-mover 
        v-if="$route.params.tool === 'holdings'"
        :flaggedInstances="flaggedInstances"/>
      <div class="" v-if="$route.params.tool === 'merge'">
        <h1>merge records</h1>
        <!-- replace this whole div with the component -->
      </div>
      <modal-component 
        v-if="showModal"
        title="Directory care list adjusted" 
        modal-type="info" 
        @close="closeModal">
        <div slot="modal-body" class="DirectoryCare-modalBody">
          <p>{{ ['The following resources could not be retrieved', 
            'because they no longer exist. They have been removed from the directory care list'] | translatePhrase }}:</p>
          <ul>
            <li v-for="error in errors.removed" :key="error['@id']">
              {{error.label}}
            </li>
          </ul>
          <div class="DirectoryCare-modalBtnContainer">
            <button class="btn btn-primary btn--md" @click="closeModal">OK</button>
          </div>
        </div>
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
