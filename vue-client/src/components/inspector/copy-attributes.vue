<script>
import ReverseRelations from '@/components/inspector/reverse-relations.vue';
import IdLabel from '@/components/shared/id-label.vue';

export default {
  name: 'copy-attributes',
  props: {
    uri: {
      type: String,
      default: '',
    },
    focusData: {
      type: Object,
      default: null,
    },
    isLibrisResource: {
      type: Boolean,
      default: false,
    },
    diffIdAdded: {
      type: Boolean,
      default: false,
    },
    diffIdRemoved: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    'id-label': IdLabel,
    'reverse-relations': ReverseRelations,
  },
  data() {
    return {
      totalReverseCount: -1,
    };
  },
  methods: {
    allCount(value) {
      this.totalReverseCount = value;
    },
  },
};

</script>

<template>
  <div class="Attributes">
    <id-label
      :uri="this.uri"
      :is-libris-resource="this.isLibrisResource"
      :diff-added="this.diffIdAdded"
      :diff-removed="this.diffIdRemoved"
    />
    <div class="Attributes-relationsContainer">
      <!--TODO: Make this work when it is possible to link to copies from the cat. client.-->
      <reverse-relations
        @numberOfRelations="allCount"
        :main-entity="focusData"
        :compact="false" />
    </div>
  </div>
</template>
<style lang="less">
  .Attributes {
    display: flex;
    &-relationsContainer {
      justify-content: flex-end;
    }
  }
</style>
