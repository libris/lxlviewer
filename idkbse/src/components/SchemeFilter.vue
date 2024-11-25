<template>
  <div class="SchemeFilter" tabindex="0" :class="{ 'is-active': isActive }" @click="setAsFilter" @keyup.enter="setAsFilter">
    <template v-if="noFilter == false">
      <span class="d-none d-sm-block">{{ label }}</span>
      <span class="d-block d-sm-none">{{ scheme.object.code }}</span>
      <span>({{ scheme.totalItems }})</span>
    </template>
    <template v-else>
      {{ translateUi('All') }}
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

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
      const sort = this.$route.query._sort;
      if (sort && sort !== '') {
        queryObj._sort = sort;
      }
      this.$router.push({ path: this.$route.path, query: queryObj });
    },
  },
  computed: {
    ...mapGetters(['settings']),
    label() {
      const schemeObj = this.scheme.object;
      if (schemeObj.titleByLang) {
        return schemeObj.titleByLang[this.settings.language] || Object.values(schemeObj.titleByLang)[0];
      }
      return this.removeBaseUri(schemeObj['@id']);
    },
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
