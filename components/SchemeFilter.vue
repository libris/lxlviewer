<template>
  <div class="SchemeFilter" :class="{ 'is-active': isActive }" @click="setAsFilter">
    <span v-if="noFilter == false">
      <span class="d-none d-sm-block">{{ scheme.object.titleByLang['sv'] }}</span>
      <span class="d-block d-sm-none">{{ scheme.object.code }}</span>
      <!-- ({{ scheme.totalItems }}) -->
    </span>
    <span v-else>
      Alla
    </span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false
    }
  },
  methods: {
    setAsFilter() {
      let newQuery = Object.assign({}, this.$route.query);
      if (this.noFilter) {
        delete newQuery['inScheme.@id'];
      } else {
        newQuery['inScheme.@id'] = this.scheme.object['@id'];
      }
      this.$router.push({ path: this.$route.path, query: newQuery });
    },
  },
  computed: {
    isActive() {
      if (this.$route.query.hasOwnProperty('inScheme.@id') == false) {
        if (this.noFilter == true) {
          return true;
        }
        return false;
      } else {
        if (this.noFilter == true) {
          return false;
        }
        return this.$route.query['inScheme.@id'] == this.scheme.object['@id'];
      }
    },
  },
  props: {
    scheme: {
      type: Object,
      default: null,
    },
    noFilter: {
      type: Boolean,
      default: false,
    }
  },
}
</script>

<style lang="scss">
.SchemeFilter {
  user-select: none;
  @media (hover: hover) {
    user-select: unset;
  }
  cursor: pointer;
  border-width: 0px 0px 3px 0px;
  border-style: solid;
  border-color: transparent;
  &:hover {
    border-color: $gray-300;
  }
  &.is-active {
    border-color: $kb-secondary-turquoise;
  }
}
</style>
