<script>
import { mapGetters } from 'vuex';
import { translatePhrase } from '@/utils/filters';

export default {
  name: 'entity-action',
  mixins: [],
  props: {
    isLarge: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: Boolean,
      default: false,
    },
    isMarked: {
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
  emits: ['action', 'highlight', 'dehighlight'],
  methods: {
    translatePhrase,
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
  <div
    class="EntityAction"
    :class="{ 'action-larger': isLarge,'has-parent-hovered': parentHovered, 'is-placeholder': placeholder, 'is-marked': isMarked }"
    role="button"
    :aria-label="translatePhrase(label)"
    tabindex="0"
    v-tooltip.top="translatePhrase(description)"
    @click="action()"
    @keyup.enter="action()"
    @focus="highlight()"
    @mouseover="highlight()"
    @blur="dehighlight()"
    @mouseout="dehighlight()"
  >
    <i :class="iconClassString" />
    <span class="action-label" v-show="isLarge">
      {{ translatePhrase(label) }}
    </span>
  </div>
</template>

<style lang="less">

.EntityAction {
  display: inline-block;
  transition: color .25s ease;
  color: @grey-transparent;
  .action-label {
    display: none;
    color: inherit;
  }
  &.is-placeholder {
    opacity: 0;
    cursor: default;
  }
  &.has-parent-hovered {
    color: @grey-darker;
  }
  &.action-larger {
    background-color: @white;
    border: 1px solid;
    border-radius: 0.25rem;
    padding: 0rem 1rem 0rem 0.5rem;
    margin: 0 0.2rem;
    .action-label {
      font-size: 1.3rem;
      display: inline-block;
      font-weight: bold;
    }
  }
  &.is-marked {
    color: @brand-accent;
  }
}

</style>
