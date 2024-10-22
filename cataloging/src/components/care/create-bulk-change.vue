<script>
import { mapGetters } from 'vuex';
import { sortBy, set, pick } from 'lodash-es';
import CreationCard from '@/components/create/creation-card.vue';
import * as RecordUtil from '@/utils/record';
import * as StringUtil from 'lxljs/string';

export default {
  name: 'create-bulkchange',
  components: {
    'creation-card': CreationCard,
  },
  data() {
    return {
      templateData: {},
      activeIndex: -1,
    };
  },
  watch: {
    templateData() {
      this.$store.dispatch('setBulkChangeInitData', this.templateData);
      this.$router.push({ path: '/directory-care/bulkchanges/new' });
    },
  },
  methods: {
    useTemplate(templateValue) {
      const preparedTemplate = RecordUtil.prepareDuplicateFor(templateValue, this.user, []);
      this.templateData = preparedTemplate;
    },
    setActiveIndex(index) {
      this.activeIndex = index;
    },
  },
  computed: {
    ...mapGetters([
      'settings',
      'userFlagged',
      'user',
      'resources',
      'templates',
    ]),
    bulkTemplates() {
      return sortBy(this.templates.combined.bulk, (template) => template.label);
    },
  },
  mounted() {
  },
};
</script>

<template>
  <div class="CreateMessage-cards">
    <creation-card
      v-for="(template, index) in bulkTemplates"
      :key="index"
      :is-base="false"
      :is-allowed="true"
      :template="template"
      :index="index + 1"
      :active-index="activeIndex"
      @use-template="useTemplate"
      @set-active-index="setActiveIndex" />
  </div>
</template>

<style lang="less">

.CreateMessage {
  padding-bottom: 2rem;

  &-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}
</style>
