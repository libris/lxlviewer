<script>
import { mapGetters } from 'vuex';
import * as VocabUtil from '@/utils/vocab';

export default {
  name: 'type-icon',
  props: {
    type: {
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
      iconMap: {
        'Text': 'file-text',
        'Text': 'file-text',
        'Audio': 'volume-up',
        'Music': 'volume-up',
        'Kit': 'archive',
        'StillImage': 'picture-o',
        'MixedMaterial': 'cubes',
        'Object': 'cube',
        'MovingImage': 'film',
        'Cartography': 'map',
        'ManuscriptCartography': 'map',
        'Dataset': 'database',
        'Multimedia': 'laptop',
        'NotatedMusic': 'music',
        'ManuscriptNotatedMusic': 'music',
      }
    };
  },
  methods: {
  },
  computed: {
    ...mapGetters([
      'resources',
    ]),
    iconClass() {
      let iconName = '';
      if (this.iconMap.hasOwnProperty(this.type)) {
        iconName = this.iconMap[this.type];
      } else {
        return '';
      }
      return `fa fa-fw fa-${iconName}`;
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
  <div class="TypeIcon">
    <span class="TypeIcon-label" v-if="iconClass === ''">/</span>
    <i :class="iconClass" v-else></i>
  </div>
</template>

<style lang="less">
.TypeIcon {
  background-color: @grey-lightest;
  color: @brand-primary;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  height: 20px;
  border-radius: 0.25rem;
  margin-right: 5px;
  font-size: 12px;

  &-label {
    font-weight: 800;
  }
}

</style>
