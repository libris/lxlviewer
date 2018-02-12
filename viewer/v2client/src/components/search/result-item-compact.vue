<script>
import LensMixin from '../mixins/lens-mixin';
import ResultMixin from '../mixins/result-mixin';
import EntitySummary from '../shared/entity-summary';
import * as StringUtil from '@/utils/string';

export default {
  name: 'result-item-compact',
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
    settings() {
      return this.$store.getters.settings;
    },
    user() {
      return this.$store.getters.user;
    },
    categorization() {
      return StringUtil.getFormattedEntries(this.getSummary.categorization, this.resources.vocab, this.settings, this.resources.context);
    },
    header() {
      return StringUtil.getFormattedEntries(this.getSummary.header, this.resources.vocab, this.settings, this.resources.context);
    },
    isLibrisResource() {
      return this.focusData['@id'].startsWith(this.settings.apiPath);
    },
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
  <div class="result-item-compact">
    <router-link v-if="isLibrisResource" class="header" :title="header.join(', ')" :to="focusData['@id'] | asFnurgelLink">{{ header.join(', ') }}</router-link>
    <a v-if="!isLibrisResource" class="header" :title="header.join(', ')" :href="focusData['@id']">{{ header.join(', ') }}</a>
    <span class="categorization" :title="categorization.join(', ')">
      {{categorization.join(', ')}}
    </span>
  </div>
</template>


<style lang="less">

.result-item-compact {
  display: flex;
  margin-bottom: 0;
  margin-top: -1px;
  background-color: @white;
  border: 1px solid #ccc;
  padding: 0.4em 1em;
  line-height: 1.2em;
  .header {
    color: @brand-primary;
    margin: 0px;
    display: inline-block;
    flex-basis: 50%;
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 16px;
    font-weight: normal;
  }
  .categorization {
    display: inline-block;
    flex-basis: 30%;
    font-size: 14px;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

</style>
