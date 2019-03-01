<script>
import { mapGetters } from 'vuex';
import { filter } from 'lodash-es';
import * as VocabUtil from '@/utils/vocab';
import TabMenu from '@/components/shared/tab-menu';
import HoldingMover from '@/components/care/holding-mover';
import ModalComponent from '@/components/shared/modal-component';
import * as StringUtil from '@/utils/string';

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
        // { 'id': 'merge', 'text': 'Merge posts' }, 
        // { 'id': 'remove', 'text': 'Batch remove' }, 
      ],
      showModal: false,
    };
  },
  computed: {
    ...mapGetters([
      'settings',
      'userCare',
      'user',
      'resources',
    ]),
    flaggedInstances() {
      return filter(this.fetchedItems, o => VocabUtil.getRecordType(o['@type'], this.resources.vocab, this.resources.context) === 'Instance');
    },
  },
  watch: {
    userCare(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.fetchAllFlagged();
      }
    },
  },
  methods: {
    switchTool(id) {
      this.$router.push({ path: `/directory-care/${id}` });
    },
    fetchOne(id) {
      const searchUrl = `${this.settings.apiPath}/${id}/data.json`; // Should be JSON, not JSON-LD
      return new Promise((resolve, reject) => {
        fetch(searchUrl)
          .then((response) => {
            if (response.ok) {
              resolve(response.json());
            } else if (response.status === 410) {
              this.errors.removed.push(id);
              this.$store.dispatch('unmark', { tag: 'Directory care', documentId: id });
              resolve();
            } else {
              this.errors.other.push(id);
              resolve();
            }
          }, (error) => {
            reject(error);
          });
      });
    },
    fetchAllFlagged() {
      const promiseArray = [];
      this.userCare.forEach((item) => {
        promiseArray.push(this.fetchOne(item));
      });
      Promise.all(promiseArray)
        .then((result) => {
          this.getMainEntities(result);
        })
        .catch(() => {
          this.$store.dispatch('pushNotification',
            { 
              type: 'danger',
              message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)}`, 
            })
            .then(() => {
              this.allDone();
            });
        });
    },
    getMainEntities(data) {
      this.fetchedItems = data.filter((item => !!item)).map(item => item.mainEntity);
      this.allDone();
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
                message: `${StringUtil.getUiPhraseByLang('The following resources could not be retrieved', this.user.settings.language)}: 
                ${this.errors.other.join(', ')}`, 
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
  <div class="DirectoryCare" v-if="fetchComplete">
    <tab-menu @go="switchTool" :tabs="tabs" :active="$route.params.tool"></tab-menu>
    <hr class="menuDivider">
    <holding-mover 
      v-if="$route.params.tool === 'holdings'"
      :flaggedInstances="flaggedInstances"/>
    <div class="" v-if="$route.params.tool === 'merge'">
      <h1>merge posts</h1>
      <!-- replace this whole div with the component -->
    </div>
    <modal-component 
      v-if="showModal"
      title="Error" 
      modal-type="danger" 
      @close="closeModal">
      <div slot="modal-header" class="">
        <header>
          {{'Error' | translatePhrase}}
        </header>
      </div>
      <div slot="modal-body" class="DirectoryCare-modalBody">
        <p>{{ ['The following resources could not be retrieved', 
          'because they no longer exist. They have been removed from the directory care list'] | translatePhrase }}:</p>
        <ul>
          <li v-for="error in errors.removed" :key="error">
            {{error}}
          </li>
        </ul>
        <div class="DirectoryCare-modalBtnContainer">
          <button class="btn btn-gray btn--md" @click="closeModal">OK</button>
        </div>
      </div>
    </modal-component>
  </div>
</template>

<style lang="less">

.DirectoryCare {
  .menuDivider {
    margin: -23px 0px 2em 0px;
    border-width: 3px;
  }

  &-modalBody {
    width: 100%;
    padding: 20px;
  }

  &-modalBtnContainer {
    margin-top: 20px;
  }
}
</style>
