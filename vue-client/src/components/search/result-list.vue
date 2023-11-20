<script>
import { cloneDeep } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as LxlDataUtil from 'lxljs/data';
import * as RecordUtil from '@/utils/record';
import ResultListItem from './result-list-item.vue';

export default {
  name: 'result-list',
  props: {
    results: Array,
    compact: Boolean,
    importData: Array,
    isChangeView: Boolean,
  },
  data() {
    return {
      keyword: '',
      relationsList: false,
    };
  },
  methods: {
    getImportItem(index) {
      if (this.importData.length !== 0) {
        const node = cloneDeep(this.importData[index].data);
        const importItem = RecordUtil.prepareDuplicateFor(LxlDataUtil.splitJson(node), this.user, this.settings.keysToClear.remoteImport);
        return importItem;
      }
      return {};
    },
    getDatabase(index) {
      if (this.importData.length !== 0) {
        return this.importData[index].database;
      }
      return '';
    },
    relationsListOpen(e) {
      if (e) {
        this.relationsList = true;
      } else {
        this.relationsList = false;
      }
    },
  },
  computed: {
    ...mapGetters([
      'resources',
      'user',
      'settings',
    ]),
  },
  components: {
    'result-list-item': ResultListItem,
  },
  mounted() { // Ready method is deprecated in 2.0, switch to "mounted"
  },
};
</script>

<template>
  <ol
    class="ResultList"
    aria-labelledby="resultDescr"
    v-if="results.length > 0">
    <result-list-item
      class="ResultList-item"
      :database="getDatabase(index)"
      :show-compact="compact"
      :focus-data="item"
      :import-item="getImportItem(index)"
      :isChangeView="isChangeView"
      v-for="(item, index) in results"
      :key="item['@id']"
      @relations-list-open="relationsListOpen" />
  </ol>
</template>

<style lang="less">
.ResultList {
  width: 100%;
  margin-bottom: 40px;
  padding: 0px;
  list-style-type: none;
}
</style>
