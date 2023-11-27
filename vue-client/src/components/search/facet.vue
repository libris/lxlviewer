<script>
import * as MathUtil from '@/utils/math';
import { asAppPath, capitalize } from '@/utils/filters';
import FacetMixin from '@/components/mixins/facet-mixin.vue';

export default {
  name: 'facet',
  mixins: [FacetMixin],
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    facet: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
    };
  },
  methods: {
    asAppPath,
    capitalize,
  },
  computed: {
    compactNumber() {
      return MathUtil.getCompactNumber(this.facet.amount);
    },
    label() {
      if (this.facet.label.indexOf('•') >= 0 && this.alwaysShowLabelTail) {
        const label = this.facet.label;
        return label.substring(0, label.lastIndexOf('•'));
      }

      return this.facet.label;
    },
    labelTail() {
      if (this.facet.label.indexOf('•') >= 0 && this.alwaysShowLabelTail) {
        const label = this.facet.label;
        const label2 = label.substring(label.lastIndexOf('•') + 1, label.length);
        const nbsp = '\xa0';
        return `${nbsp}• ${label2}`;
      }

      return '';
    },
    alwaysShowLabelTail() {
      return this.facet.object && (this.facet.object['@type'] === 'Library' || this.facet.object['@type'] === 'Bibliography');
    },
  },
  components: {
  },
};
</script>

<template>
  <li class="Facet">
    <slot name="icon" />
    <router-link
      class="Facet-link"
      :to="asAppPath(facet.link, this.$route.params.tool === 'changes')"
      :title="capitalize(facet.label)">
      <span
        class="Facet-label"
        :title="capitalize(facet.label)">
        {{ capitalize(label) }}</span>
      <span
        class="Facet-labelTail"
        :title="capitalize(facet.label)">
        {{labelTail}}</span>
      <span class="Facet-badge badge">{{compactNumber}}</span>
    </router-link>
  </li>
</template>

<style lang="less">

.Facet {
  display: flex;
  align-items: center;
  font-size: 1.4rem;

  &-link {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;

    &:hover {
      text-decoration: none;
      & .Facet-label {
        text-decoration: underline;
      }
      & .Facet-labelTail {
        text-decoration: underline;
      }
    }
  }

  &-badge {
    min-width: auto;
  }

  &-label {
    cursor: pointer;
    color: @black;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-labelTail {
    cursor: pointer;
    color: @black;
    flex-shrink: 0;
    flex-grow: 20;
    margin-right: 10px;
  }
}

</style>
