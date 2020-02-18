<script>
import { mapGetters } from 'vuex';
import { each, isObject, orderBy } from 'lodash-es';
import * as StringUtil from '@/utils/string';
import EntityForm from '@/components/inspector/entity-form';
import TabMenu from '@/components/shared/tab-menu';

export default {
  name: 'DetailedEnrichment',
  props: {
  },
  components: {
    'entity-form': EntityForm,
    'tab-menu': TabMenu,
  },
  data() {
    return {
      selected: [],
      formFocus: 'mainEntity',
    };
  },
  computed: {
    ...mapGetters([
      'enrichment',
      'settings',
      'user',
    ]),
    recordType() {
      return this.enrichment.data.source.mainEntity['@type'];
    },
    formTabs() {
      return [
        { id: 'mainEntity', text: this.$options.filters.labelByLang(this.recordType) },
        { id: 'record', text: 'Admin metadata' },
      ];
    },
  },
  watch: {
  },
  methods: {
    setFocus(focus) {
      this.formFocus = focus;
    },
  },
  mounted() {
    this.$nextTick(() => {
    });
  },

};
</script>

<template>
  <div class="DetailedEnrichment">
    <tab-menu @go="setFocus" :tabs="formTabs" :active="formFocus" />
    <entity-form
      v-for="tab in formTabs"
      :editing-object="tab.id"
      :key="tab.id"
      :is-active="formFocus === tab.id"
      :form-data="enrichment.data.source[tab.id]"
      :locked="true">
    </entity-form>
  </div>
</template>

<style lang="less">

.DetailedEnrichment {
  width: 100%;
  height: 80vh;
  padding: 0 1em;
  overflow-y: scroll;
}

</style>
