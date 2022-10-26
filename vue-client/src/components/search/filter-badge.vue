<script>
import { mapGetters } from 'vuex';

export default {
  name: 'FilterBadge',
  props: {
    filter: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      keyword: '',
    };
  },
  methods: {
  },
  computed: {
    ...mapGetters([
      'settings',
      'user',
    ]),
    variableLabel() {
      let chainLabel = '';
      if (this.settings.propertyChains.hasOwnProperty(this.filter.variable)) {
        chainLabel = this.settings.propertyChains[this.filter.variable][this.user.settings.language];
      }
      return chainLabel;
    },
  },
  components: {
  },
  watch: {
    keyword(value, oldval) {
      console.log('keyword changed', value, oldval);
    },
  },
  mounted() {
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div class="FilterBadge">
    <span v-if="variableLabel.length > 0">{{ variableLabel }}:</span>
    <span>{{ filter.label | labelByLang }}</span>
    <router-link
      :to="filter.up | asAppPath">
      <i class="fa fa-fw fa-times icon"
        ></i>
    </router-link>
  </div>
</template>

<style lang="less">
  .FilterBadge {
    background-color: #364a4c;
    border: 1px solid #364a4c;
    color: @white;
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
      color: @white;
    }

    &.clear-all {
      color: inherit;
      background-color: @white;
      border: 1px solid @grey-lighter;

      & i,
      & i:hover {
        color: inherit;
      }
    }

  }
</style>
