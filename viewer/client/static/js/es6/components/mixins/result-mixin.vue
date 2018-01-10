<script>
import * as DataUtil from '../../utils/data';
import * as httpUtil from '../../utils/http';
import * as _ from 'lodash';
import { getStatus } from '../../vuex/getters';
import { changeStatus } from '../../vuex/actions';

export default {
  vuex: {
    actions: {
      changeStatus,
    },
    getters: {
      status: getStatus,
    },
  },
  data(){
    return {
      removed: false,
    }
  },
  methods: {
    importThis() {
      const json = JSON.stringify(this.importItem);
      this.$dispatch('set-import', json);
    },
  },
  events: {
    'import-this'(){
      this.importThis();
    },
  },
  computed: {
    isImport() {
      if (typeof this.importItem !== undefined && this.importItem['@graph'] && this.importItem['@graph'].length > 0 && this.importItem['@graph'][0].hasOwnProperty('@id')) {
        return true;
      }
      return false;
    },
  },
  watch: {

  },
};
</script>

<style lang="less">
.import-header {
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
</style>
