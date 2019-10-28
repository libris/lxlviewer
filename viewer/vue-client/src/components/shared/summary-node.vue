<script>
/*

*/
import LensMixin from '@/components/mixins/lens-mixin';
import ItemMixin from '@/components/mixins/item-mixin';
import * as StringUtil from '@/utils/string';

export default {
  name: 'summary-node',
  mixins: [LensMixin, ItemMixin],
  props: {
    item: {
      type: [Object, String],
      default: null,
    },
    parentId: {
      type: String,
      default: '',
    },
    isLast: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
    };
  },
  methods: {
  },
  computed: {
    isLinked() {
      if (this.focusData.hasOwnProperty('@id') && this.focusData['@id'].split('#')[0] !== this.parentId.split('#')[0]) {
        return true;
      }
      return false;
    },
    isLibrisResource() {
      return StringUtil.isLibrisResourceUri(this.item['@id'], this.settings);
    },
    routerPath() {
      if (this.focusData.hasOwnProperty('@id')) {
        const uriParts = this.item['@id'].split('/');
        const fnurgel = uriParts[uriParts.length - 1];
        return `/${fnurgel}`;
      }
      return '';
    },
  },
  components: {
  },
  watch: {
  },
  mounted() {
    this.$nextTick(() => {});
  },
};
</script>

<template>
  <div class="SummaryNode">
    <span class="SummaryNode-label" v-if="!isLinked">
      {{ typeof item === 'string' ? item : getItemLabel }}{{ isLast ? '' : ',&nbsp;' }}
    </span>
    <span v-if="isLinked" class="SummaryNode-link tooltip-target" @mouseover="hoverIn" @mouseout="hoverOut">
      <router-link v-if="isLibrisResource" :to="routerPath">{{getItemLabel}}</router-link>
      <a v-if="!isLibrisResource" :href="item['@id']">{{getItemLabel}}</a>
    </span>
  </div>
</template>

<style lang="less">
.SummaryNode {
  display: inline-block;
  &-link {
    margin-right: 0.5em;
    > a {
      border-color: @brand-primary;
      color: darken(@brand-primary, 10%);
      text-decoration-line: underline;
      text-decoration-style: dotted;
      &:hover {
        color: darken(@brand-primary, 20%);
        border-color: darken(@brand-primary, 20%);
      }
    }
  }
}

</style>