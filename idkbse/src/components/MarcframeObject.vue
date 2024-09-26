<template>
  <div class="MarcframeObject">
    <template v-if="value">
      <MarcframeRow :property="key" :value="subvalue" :link-value="linkProps.includes(key)" v-for="(subvalue, key) in mainProperties" :key="key" />
      <template v-if="subfieldOrder != null">
        <MarcframeRow :property="`$${key}`" :value="subfields[`$${key}`]" :link-value="linkProps.includes(key)" v-for="key in subfieldOrder" :key="key" />
      </template>
      <template v-else>
        <MarcframeRow :property="key" :value="value" :link-value="linkProps.includes(key)" v-for="(value, key) in subfields" :key="key" />
      </template>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import LensMixin from '@/mixins/lens';
import EntityNode from '@/components/EntityNode';

export default {
  name: 'MarcframeObject',
  mixins: [LensMixin],
  data() {
    return {
      show: false,
      linkProps: [
        'addLink',
        'resourceType',
        'property',
        'addProperty',
        'link',
      ],
      hiddenProps: [
        'onRevertPrefer',
        'include',
        'groupId',
        'subfieldOrder',
        'pendingResources',
        'uriTemplate',
        'aboutEntity',
      ],
    }
  },
  props: {
    value: {
      type: [Object, String, Number, Array, Boolean],
    },
  },
  methods: {
  },
  computed: {
    ...mapGetters(['settings', 'vocabContext', 'display', 'vocab']),
    mainProperties() {
      const mainProperties = {};
      for (const [key, value] of Object.entries(this.value)) {
        if (key.startsWith('$') == false && key.startsWith('_') == false) {
          if (value == null) continue;
          if (this.hiddenProps.includes(key)) continue;

          mainProperties[key] = value;
        }
      }
      return mainProperties;
    },
    subfieldOrder() {
      if (this.value.hasOwnProperty('subfieldOrder') == false) {
        return null;
      }
      const order = this.value.subfieldOrder.split(' ').filter(item => this.value.hasOwnProperty(`$${item}`));
      return order;
    },
    subfields() {
      const subfields = {};
      for (const [key, value] of Object.entries(this.value)) {
        if (key.startsWith('$')) {
          subfields[key] = value;
        }
      }
      return subfields;
    },
  },
  components: {
    EntityNode,
    MarcframeRow: () => import('@/components/MarcframeRow.vue'),
  },
}
</script>

<style lang="scss">
.MarcframeObject {

}
</style>
