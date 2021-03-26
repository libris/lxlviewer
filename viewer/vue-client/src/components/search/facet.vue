<script>
import FacetMixin from '@/components/mixins/facet-mixin';

export default {
  name: 'facet',
  mixins: [FacetMixin],
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    observation: {},
  },
  data() {
    return {
    };
  },
  methods: {
  },
  computed: {
    focusData() {
      return this.observation.object;
    },
    label() {
      return this.determineLabel(this.observation.object);
    },
    compactNumber() {
      return this.getCompactNumber(this.observation);
    },
  },
  components: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      
    });
  },
};
</script>

<template>
  <li class="Facet">
    <slot name="icon"></slot>
    <router-link class="Facet-link"
      :to="observation.view['@id'] | asAppPath" 
      :title="label | capitalize">
      <span class="Facet-label"
        :title="label | capitalize">
        {{label | capitalize}}</span>
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
    }
  }

  &-badge {
    min-width: auto;
  }

  &-label {
    cursor: pointer;
    margin-right: 10px;
    color: @black;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

</style>
