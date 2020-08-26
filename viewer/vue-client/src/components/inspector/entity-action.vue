<script>
import { mapGetters } from 'vuex';

export default {
  name: 'entity-action',
  mixins: [],
  props: {
    isLarge: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    parentHovered: {
      type: Boolean,
      defalt: false,
    },
  },
  data() {
    return {
    };
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    iconClassString() {
      return `fa fa-fw fa-${this.icon} icon--sm`;
    },
  },
  mounted() {
    this.$nextTick(() => {
    });
  },
  watch: {
  },
  methods: {
    action() {
      this.$emit('action');
    },
    highlight() {
      this.$emit('highlight');
    },
    dehighlight() {
      this.$emit('dehighlight');
    },
  },
  components: {

  },
};
</script>

<template>
  <div class="EntityAction" :class="{'action-larger': isLarge, 'has-parent-hovered': parentHovered }"
    role="button"
    :aria-label="label | translatePhrase"
    tabindex="0"
    ref="linkAction"
    v-tooltip.top="translate(description)"
    @click="action()"
    @keyup.enter="action()"
    @focus="highlight()"
    @mouseover="highlight()" 
    @blur="dehighlight()"
    @mouseout="dehighlight()"
  >
    <i :class="iconClassString">
    </i>
    <span class="action-label" v-show="isLarge">
      {{ label | translatePhrase }}
    </span>
  </div>
</template>

<style lang="less">

.EntityAction {
  display: inline-block;
  transition: color .25s ease;
  color: @grey-light;
  .action-label {
    display: none;
    color: inherit;
  }
  &.has-parent-hovered {
    color: @grey-darker;
  }
  &.action-larger {
    background-color: @white;
    border: 1px solid;
    border-radius: 2rem;
    padding: 0rem 1rem 0rem 0.5rem;
    .action-label {
      font-size: 1.3rem;
      display: inline-block;
      font-weight: bold;
    }
  }
}

</style>
