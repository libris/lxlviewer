<script>
/*

*/
import * as StringUtil from 'lxltools/string';
import LensMixin from '@/components/mixins/lens-mixin';
import ItemMixin from '@/components/mixins/item-mixin';
import PreviewCard from '@/components/shared/preview-card';

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
    },
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
      return StringUtil.isLibrisResourceUri(this.recordId, this.settings);
    },
    routerPath() {
      const uriParts = this.recordId.split('/');
      const fnurgel = uriParts[uriParts.length - 1];
      return `/${fnurgel}`;
    },
  },
  components: {
    PreviewCard,
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
      {{ typeof item === 'string' ? getStringLabel : getItemLabel }}{{ isLast ? '' : ',&nbsp;' }}
    </span>
    <v-popover v-if="isLinked" :disabled="!hoverLinks" @show="$refs.previewCard.populateData()" placement="bottom-start">
      <span class="SummaryNode-link tooltip-target">
        <router-link v-if="isLibrisResource" :to="routerPath">{{getItemLabel}}</router-link>
        <a v-if="!isLibrisResource" :href="focusData['@id'] | convertResourceLink">{{getItemLabel}}</a>
      </span>
      <template slot="popover" v-if="hoverLinks">
        <PreviewCard ref="previewCard" :focus-data="focusData" :record-id="recordId" />
      </template>
    </v-popover>
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
