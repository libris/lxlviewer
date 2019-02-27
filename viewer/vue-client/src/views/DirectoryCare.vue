<script>
import { mapGetters } from 'vuex';
import { filter } from 'lodash-es';
import * as VocabUtil from '@/utils/vocab';
import TabMenu from '@/components/shared/tab-menu';
import HoldingMover from '@/components/care/holding-mover';

export default {
  name: 'DirectoryCare',
  components: {
    'tab-menu': TabMenu,
    'holding-mover': HoldingMover,
  },
  data() {
    return {
      fetchedItems: [],
      fetchComplete: false,
      error: '',
      tabs: [
        { id: 'holdings', text: 'Move holdings' },
        // { 'id': 'merge', 'text': 'Merge posts' }, 
        // { 'id': 'remove', 'text': 'Batch remove' }, 
      ],
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
        fetch(searchUrl).then((response) => {
          resolve(response.json());
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
      Promise.all(promiseArray).then((result) => {
        this.getMainEntities(result);
      }, (error) => {
        this.error = error;
        this.allDone();
      });
    },
    getMainEntities(data) {
      this.fetchedItems = data.map(item => item.mainEntity);
      this.allDone();
    },
    allDone() {
      this.$store.dispatch('removeLoadingIndicator', 'Loading')
        .then(() => {
          this.fetchComplete = true;
        });
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
      :flaggedInstances="flaggedInstances"
      :error="error" />
    <div class="" v-if="$route.params.tool === 'merge'">
      <h1>merge posts</h1>
      <!-- replace this whole div with the component -->
    </div>
  </div>
</template>

<style lang="less">

.DirectoryCare {
  .menuDivider {
    margin: -23px 0px 2em 0px;
    border-width: 3px;
  }
}
</style>
