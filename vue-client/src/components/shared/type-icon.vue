<script lang="js">
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
    showIconscss: {
      type: Boolean,
      default: true,
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
        return null;
      }
      return ['fas', iconName];
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
  <div class="TypeIcon" v-if="showIconscss === true || iconClass !== '' || isForcedUnspecified">
    <span class="TypeIcon-label" v-if="iconClass === '' || isForcedUnspecified">/</span>
    <font-awesome-icon :icon="iconClass" v-if="iconClass != null"></font-awesome-icon>
  </div>
</template>

<style lang="scss">
.TypeIcon {
  background-color: $grey-lightest;
  color: $brand-primary;
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
