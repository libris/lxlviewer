<script>
import LensMixin from '../mixins/lens-mixin';
import ResultMixin from '../mixins/result-mixin';
import EntitySummary from '../shared/entity-summary';

export default {
  name: 'result-item-detailed',
  mixins: [LensMixin, ResultMixin],
  props: {
    focusData: {},
    importItem: {},
  },
  data() {
    return {
      keyword: '',
    }
  },
  methods: {
  },
  computed: {
  },
  components: {
    'entity-summary': EntitySummary,
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
  },
};
</script>

<template>
  <div class="result-item-detailed">
    <entity-summary :focus-data="focusData" :router-path="focusData['@id'] | asFnurgelLink" :is-import="isImport" :import-item="importItem" :add-link="true" :lines="4"></entity-summary>
  </div>
</template>


<style lang="less">

.result-item-detailed {
  list-style: none;
  margin-bottom: 0.5em;
  .panel-mixin(@neutral-color);
  code {
    color: @black;
  }
  .label {
    color: @black;
    font-weight: bold;
    font-size: 16px;
    display: inline-block;
    width: 74%;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .type {
    width: 24%;
    display: inline-block;
    text-align: right;
  }
}

</style>
