<script>
import { mapGetters } from 'vuex';

export default {
  name: 'check-box',
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
        Text: 'file-text',
        ManuscriptText: 'file-text',
        Audio: 'volume-up',
        Music: 'volume-up',
        Kit: 'archive',
        StillImage: 'picture-o',
        MixedMaterial: 'cubes',
        Object: 'cube',
        MovingImage: 'film',
        Cartography: 'map',
        ManuscriptCartography: 'map',
        Dataset: 'database',
        Multimedia: 'laptop',
        NotatedMusic: 'music',
        ManuscriptNotatedMusic: 'music',
        // Place: 'map-marker',
      },
      forcedUnspecified: [
        'Work',
      ],
    };
  },
  methods: {
  },
  computed: {
    ...mapGetters([
      'resources',
    ]),
    convertedType() {
      return this.type.replace('https://id.kb.se/vocab/', '');
    },
    isForcedUnspecified() {
      return this.forcedUnspecified.indexOf(this.convertedType) > -1;
    },
    iconClass() {
      let iconName = '';
      if (this.iconMap.hasOwnProperty(this.convertedType)) {
        iconName = this.iconMap[this.convertedType];
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
    <input id="test" class="customCheckbox-input" type="checkbox">
    <div class="customCheckbox-icon"></div>
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
