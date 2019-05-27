<script>
export default {
  name: 'encoding-level-icon',
  props: {
    encodingLevel: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
    };
  },
  methods: {
  },
  computed: {
    mappings() {
      switch (this.encodingLevel) {
        case 'marc:FullLevel':
          return {
            label: 'NB',
            style: {
              color: '#61215C',
              'background-color': '#E1D4E0',
            },
          };
        case 'marc:MinimalLevel':
          return {
            label: 'B',
            style: {
              color: '#0076BA',
              'background-color': '#D4E3EF',
            },
          };
        case 'marc:AbbreviatedLevel':
          return {
            label: 'M',
            style: {
              color: '#3B8D47',
              'background-color': '#D9EBDC',
            },
          };
        case 'marc:PrepublicationLevel':
          return {
            label: 'C',
            style: {
              color: '#E59148',
              'background-color': '#FAE9DB',
            },
          };
        case 'marc:PartialPreliminaryLevel':
          return {
            label: 'P',
            style: {
              color: '#CD534C',
              'background-color': '#F5DDDC',
            },
          };
        case 'marc:FullLevelMaterialNotExamined':
        case 'marc:LessThanFullLevelMaterialNotExamined':
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
    this.$nextTick(() => {});
  },
};
</script>

<template>
  <div class="EncodingLevelIcon" :style="mappings.style">
    <span class="EncodingLevelIcon-label">{{mappings.label}}</span>
  </div>
</template>

<style lang="less">
.EncodingLevelIcon {
  display: flex;
  justify-content: center;
  align-items: baseline;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 5px;
  cursor: pointer;

  &-label {
    font-size: 12px;
    font-weight: 600;
  }
}

</style>
