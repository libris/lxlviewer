<template>
  <div class="SchemeFilter" tabindex="0" :class="{ 'is-active': isActive }" @click="setAsFilter" @keyup.enter="setAsFilter">
    <template v-if="noFilter == false">
      <span class="d-none d-sm-block">{{ scheme.object.titleByLang[settings.language] || Object.values(scheme.object.titleByLang)[0] }}</span>
      <span class="d-block d-sm-none">{{ scheme.object.code }}</span>
      <span>({{ scheme.totalItems }})</span>
    </template>
    <template v-else>
      {{ translateUi('All') }}
    </template>
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
      const queryObj = {};
      if (this.$route.query.hasOwnProperty('q')) {
        queryObj.q = this.$route.query.q;
      }
      if (this.noFilter == false) {
        queryObj['inScheme.@id'] = this.scheme.object['@id'];
      }
      this.$router.push({ path: this.$route.path, query: queryObj });
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
  span {
    white-space: nowrap;
  }
  display: flex;
  gap: 0.25em;
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
