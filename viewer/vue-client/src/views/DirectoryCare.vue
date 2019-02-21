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
        this.fetchComplete = true;
        this.error = error;
      });
    },
    getMainEntities(data) {
      this.fetchedItems = data.map(item => item.mainEntity);
      this.fetchComplete = true;
    },
  },
  mounted() {
    if (this.$route.params.tool === '' || typeof this.$route.params.tool === 'undefined') {
      this.$router.push({ path: '/directory-care/holdings' });
    }
    this.fetchAllFlagged();
  },
};
</script>

<template>
  <div class="DirectoryCare">
    <tab-menu @go="switchTool" :tabs="[
      { 'id': 'holdings', 'text': 'Move holdings' },
      { 'id': 'merge', 'text': 'Merge posts' },
    ]" :active="$route.params.tool"></tab-menu>
    <hr class="menuDivider">
    <holding-mover 
      v-if="$route.params.tool === 'holdings'"
      :flaggedInstances="flaggedInstances"
      :fetchComplete="fetchComplete"
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
