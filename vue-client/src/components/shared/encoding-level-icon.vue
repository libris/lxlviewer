<script>
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';

export default {
  name: 'encoding-level-icon',
  props: {
    encodingLevel: {
      type: String,
      required: true,
    },
    tooltipText: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
    };
  },
  methods: {
  },
  computed: {
    ...mapGetters([
      'resources',
    ]),
    levelObj() {
      return VocabUtil.getTermObject(this.encodingLevel, this.resources.vocab, this.resources.context);
    },
    levelId() {
      if (this.levelObj) {
        return this.levelObj['@id'];
      } return this.encodingLevel;
    },
    icon() {
      const icon = {};
      const smaller = { 'font-size': '11px', 'padding-top': '1px' };
      switch (this.levelId) {
        case 'https://id.kb.se/marc/FullLevel':
          icon.label = 'NB';
          icon.style = {
            color: '#61215C',
            'background-color': '#E1D4E0',
            ...smaller,
          };
          break;
        case 'https://id.kb.se/marc/MinimalLevel':
          icon.label = 'B';
          icon.style = {
            color: '#205999',
            'background-color': '#D4E3EF',
          };
          break;
        case 'https://id.kb.se/marc/AbbreviatedLevel':
          icon.label = 'M';
          icon.style = {
            color: '#196f25',
            'background-color': '#D9EBDC',
          };
          break;
        case 'https://id.kb.se/marc/PrepublicationLevel':
          icon.label = 'F';
          icon.style = {
            color: '#a14311',
            'background-color': '#FAE9DB',
          };
          break;
        case 'https://id.kb.se/marc/PartialPreliminaryLevel':
          icon.label = 'P';
          icon.style = {
            color: '#972222',
            'background-color': '#F5DDDC',
          };
          break;
        case 'https://id.kb.se/marc/FullLevelMaterialNotExamined':
        case 'https://id.kb.se/marc/LessThanFullLevelMaterialNotExamined':
          icon.label = 'R';
          break;
        case 'https://id.kb.se/marc/CompleteAuthorityRecord':
          icon.label = 'FU';
          icon.style = smaller;
          break;
        case 'https://id.kb.se/marc/IncompleteAuthorityRecord':
          icon.label = 'O';
          break;
        default:
          return {
            label: '/',
          };
      }
      return icon;
    },
  },
  components: {
  },
  mounted() {
    this.$nextTick(() => {});
  },
};
</script>

<template>
  <div
    class="EncodingLevelIcon"
    :style="icon.style"
    v-tooltip.top="tooltipText">
    <span class="EncodingLevelIcon-label">{{icon.label}}</span>
  </div>
</template>

<style lang="less">
.EncodingLevelIcon {
  background-color: @grey-lighter;
  color: #444;
  display: flex;
  justify-content: center;
  align-items: baseline;
  min-width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 5px;
  font-size: 12px;

  &-label {
    font-weight: 600;
  }
}

</style>
