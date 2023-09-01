<script>
import { labelByLang, asAppPath } from '@/utils/filters';

export default {
  name: 'FilterBadge',
  props: {
    filter: {
      type: Object,
      default: null,
    },
  },
  methods: {
    labelByLang, asAppPath,
  }
};
</script>

<template>
  <div class="FilterBadge">
    <span v-if="filter.predicateLabel.length > 0">{{ filter.predicateLabel }}:</span>
    <span>{{ labelByLang(filter.label) }}</span>
    <router-link :to="asAppPath(filter.up)">
      <i class="fa fa-fw fa-close icon"></i>
    </router-link>
  </div>
</template>

<style lang="scss">
  .FilterBadge {
    background-color: #364a4c;
    border: 1px solid #364a4c;
    color: $white;
    font-weight: 600;
    font-size: 1.4rem;
    padding: 2px 5px 2px 10px;
    margin: 5px 5px 0 0;
    border-radius: 4px;
    white-space: nowrap;
    &--inverted {
      background-color: transparent;
      border: 1px solid #364a4c;
      color: #364a4c;
      font-weight: 600;
      font-size: 1.4rem;
      padding: 2px 5px 2px 10px;
      margin: 5px 5px 0 0;
      border-radius: 4px;
      white-space: nowrap;
    }

    & i,
    & i:hover {
      color: $white;
    }

    &.clear-all {
      color: inherit;
      background-color: $white;
      border: 1px solid $grey-lighter;

      & i,
      & i:hover {
        color: inherit;
      }
    }

  }
</style>
