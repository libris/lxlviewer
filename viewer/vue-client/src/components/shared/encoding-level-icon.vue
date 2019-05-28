<script>
import { mapGetters } from 'vuex';
import * as VocabUtil from '@/utils/vocab';

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
      switch (this.levelId) {
        case 'https://id.kb.se/marc/FullLevel':
          return {
            label: 'NB',
            style: {
              color: '#61215C',
              'background-color': '#E1D4E0',
              'font-size': '11px',
              'padding-top': '1px',
            },
          };
        case 'https://id.kb.se/marc/MinimalLevel':
          return {
            label: 'B',
            style: {
              color: '#0076BA',
              'background-color': '#D4E3EF',
            },
          };
        case 'https://id.kb.se/marc/AbbreviatedLevel':
          return {
            label: 'M',
            style: {
              color: '#3B8D47',
              'background-color': '#D9EBDC',
            },
          };
        case 'https://id.kb.se/marc/PrepublicationLevel':
          return {
            label: 'C',
            style: {
              color: '#E59148',
              'background-color': '#FAE9DB',
            },
          };
        case 'https://id.kb.se/marc/PartialPreliminaryLevel':
          return {
            label: 'P',
            style: {
              color: '#CD534C',
              'background-color': '#F5DDDC',
            },
          };
        case 'https://id.kb.se/marc/FullLevelMaterialNotExamined':
        case 'https://id.kb.se/marc/LessThanFullLevelMaterialNotExamined':
          return {
            label: 'R',
            style: {
              color: '#929292',
              'background-color': '#EBEBEB',
            },
          };
        default:
          return {
            label: '/',
            style: {
              color: '#929292',
              'background-color': '#EBEBEB',
            },
          };
      }
    },
  },
  components: {
  },
  watch: {
  },
  mounted() {
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
  <div class="EncodingLevelIcon"
    :class="{'has-tooltip': tooltipText}"
    :style="icon.style"
    v-tooltip.top="tooltipText">
    <span class="EncodingLevelIcon-label">{{icon.label}}</span>
  </div>
</template>

<style lang="less">
.EncodingLevelIcon {
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

  &.has-tooltip {
    cursor: pointer;
  }
}

</style>
