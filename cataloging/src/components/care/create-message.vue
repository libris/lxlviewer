<script>
import { mapGetters } from 'vuex';
import { sortBy, set, pick } from 'lodash-es';
import CreationCard from '@/components/create/creation-card.vue';
import * as RecordUtil from '@/utils/record';
import * as StringUtil from 'lxljs/string';

export default {
  name: 'create-message',
  components: {
    'creation-card': CreationCard,
  },
  data() {
    return {
      thingData: {},
      activeIndex: -1,
    };
  },
  watch: {
    thingData() {
      this.$store.dispatch('setInsertData', this.thingData);
      this.$router.push({ path: '/new' });
    },
  },
  methods: {
    useTemplate(templateValue) {
      const preparedTemplate = RecordUtil.prepareDuplicateFor(templateValue, this.user, this.settings.keysToClear.duplication);
      if (preparedTemplate['@graph'][1].hasOwnProperty('concerning')) {
        set(preparedTemplate, ['@graph', 1, 'concerning'], this.userFlagged.map((f) => pick(f, '@id')));
      } else {
        set(preparedTemplate, ['@graph', 1, 'concerning'], []);
      }
      if (preparedTemplate['@graph'][1].hasOwnProperty('descriptionCreator')) {
        set(preparedTemplate, ['@graph', 1, 'descriptionCreator'], { '@id': StringUtil.getLibraryUri(this.user.settings.activeSigel) });
      }
      this.thingData = preparedTemplate;
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
    messageTemplates() {
      const sorted = sortBy(this.templates.combined.messages, (template) => template.label);
      return sorted;
    },
  },
  mounted() {
  },
};
</script>

<template>
  <div class="CreateMessage-cards">
    <creation-card
      v-for="(template, index) in messageTemplates"
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
