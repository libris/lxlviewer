<script>
import { mapGetters } from 'vuex';
import { translatePhrase } from '@/utils/filters';
import ItemMixin from '../mixins/item-mixin.vue';

export default {
  name: 'item-grouped',
  mixins: [ItemMixin],
  props: {
    item: {
      type: Object,
      default: () => {},
    },
    fieldKey: {
      type: String,
      default: '',
    },
    index: Number,
    isLocked: {
      type: Boolean,
      default: false,
    },
    isCard: {
      type: Boolean,
      default: false,
    },
    entityType: {
      type: String,
      default: '',
    },
    parentPath: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      expanded: this.isCard,
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
    groupedItems() {
      return this.item.items;
    },
    showKeys() {
      if (Object.keys(this.groupedItems).length > 1) {
        return true;
      }
      return false;
    },
    isInForm() {
      if (this.parentPath.indexOf('mainEntity') === 0) {
        return true;
      }
      return false;
    },
    getLabelText() {
      if (this.item.totalItems === 1) {
        return 'link';
      } else {
        return 'links';
      }
    },
  },
  mounted() {
    if (this.isInForm || this.$store.state.settings.defaultExpandedProperties.includes(this.fieldKey)) {
      this.expand();
    }
  },
  watch: {
    'inspector.event'(val) {
      if (val.name === 'form-control') {
        switch (val.value) {
          case 'collapse-item':
            this.collapse();
            break;
          case 'expand-item':
            this.expand();
            break;
          default:
        }
      }
    },
  },
  methods: {
    translatePhrase,
    expand() {
      this.expanded = true;
    },
    collapse() {
      this.expanded = false;
    },
    toggleExpanded() {
      if (this.expanded === true) {
        this.collapse();
      } else {
        this.expand();
      }
    },
  },
  components: {
  },
};
</script>

<template>
  <div
    class="ItemGrouped"
    :id="`formPath-${path}`"
    :class="{ 'is-expanded': expanded }"
    @keyup.enter="checkFocus()"
    @focus="addFocus()"
    @blur="removeFocus()">

    <strong class="ItemGrouped-heading" v-if="!isInForm">
      <div
        class="ItemGrouped-label"
        :class="{ 'is-locked': isLocked }"
        @click="toggleExpanded()">
        <i class="ItemGrouped-arrow fa fa-chevron-right" />
        <span class="ItemGrouped-labelContent">{{ item.totalItems }} {{ translatePhrase(getLabelText) }}</span>
      </div>
    </strong>

    <ul
      class="ItemGrouped-list"
      :class="{ 'has-hidden-keys': !showKeys }">
      <field
        v-for="(value, key) in groupedItems"
        :key="key"
        :entity-type="entityType"
        :is-inner="false"
        :is-locked="true"
        :is-removable="false"
        :is-grouped="true"
        :is-card="isCard"
        :show-key="showKeys"
        :override-label="key"
        :field-key="fieldKey"
        :field-value="value" />
    </ul>
  </div>
</template>

<style lang="less">
.ItemGrouped {
  width: 100%;
  padding: 5px 0;
  position: relative;
  flex: 1 100%;
  transition: background-color .5s ease;

  &-heading {
    display: block;
    flex: 1 100%;
    font-weight: normal;
    position: relative;

    .is-expanded & {
      margin-bottom: 0.5rem;
    }
    .icon-hover();
  }

  &-label {
    cursor: pointer;

    &.is-inactive {
      pointer-events: none;
    }
  }

  &-labelContent {
    margin: 0 0.5rem;
  }

  &-arrow {
    transition: all 0.2s ease;
    padding: 0 2px;
    font-size: 14px;
    color: @grey-darker-transparent;

    .ItemGrouped-label:hover & {
      color: @black;
    }
  }

  &.is-expanded >
  .ItemGrouped-heading >
  .ItemGrouped-label >
  .ItemGrouped-arrow {
    transform:rotate(90deg);
    transform-origin: center;
  }

  &.is-highlighted {
    background-color: @form-highlight;
  }

  &-list {
    display: none;
    flex: 1 100%;
    position: relative;
    padding: 0 0 0 4px;

    .is-expanded & {
      display: block;
    }

    &.has-hidden-keys {
      margin-left: -1em;
    }
  }
}

</style>
