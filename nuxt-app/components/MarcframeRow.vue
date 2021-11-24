<template>
  <div class="MarcframeRow" :data-property="property">
    <div class="MarcframeRow-cell">{{ property }}</div>
    <div class="MarcframeRow-cell">
      <EntityNode v-if="linkValue" :parent-key="property" :entity="{'@id': `https://id.kb.se/vocab/${value}` }" />
      <MarcframeObject v-else-if="typeof value === 'object'" :value="value" />
      <template v-else>{{ value }}</template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import LensMixin from '@/mixins/lens';
import EntityNode from '@/components/EntityNode';
import MarcframeObject from '@/components/MarcframeObject';
import * as DisplayUtil from 'lxljs/display';

export default {
  name: 'MarcframeRow',
  mixins: [LensMixin],
  data() {
    return {
      show: false
    }
  },
  props: {
    property: {
      type: [String, Number],
      default: '',
    },
    value: {
      type: [Object, String, Number, Array, Boolean],
    },
    linkValue: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
  },
  computed: {
    ...mapGetters(['settings', 'vocabContext', 'display', 'vocab']),
  },
  components: {
    EntityNode,
    MarcframeObject: () => import('@/components/MarcframeObject.vue'),
  },
}
</script>

<style lang="scss">
.MarcframeRow {
  display: flex;
  width: 100%;
  border: solid $gray-400;
  border-width: 0px 0px 1px 0px;
  a {
    color: $kb-secondary-turquoise;
  }
  &:last-child {
    border-width: 0px;
  }
  &-cell {
    padding: 0 0.5em 0.5em 0;
  }
  > div {
    &:first-of-type {
      width: 5em;
      word-break: break-all;
      @media (min-width: 992px) {
        width: 10em;
      }
    }
    &:not(:first-of-type) {
      flex-grow: 1;
      word-break: break-all;
    }
  }
}
</style>
