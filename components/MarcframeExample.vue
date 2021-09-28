<template>
  <div class="MarcframeExample">
    <div class="MarcframeExample-header">Example: {{ example.name ? example.name : '-' }}</div>
    <div class="MarcframeExample-body">
      <div v-if="source != null">
        <div class="MarcframeExample-label">MARC</div>
        <pre>{{ source }}</pre>
      </div>
      <div v-if="normalized != null">
        <div class="MarcframeExample-label">Normalized MARC:<br>
        </div>
        <pre>{{ normalized }}</pre>
      </div>
      <div v-if="result != null">
        <div class="MarcframeExample-label">JSON-LD</div>
        <pre>{{ result }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import LensMixin from '@/mixins/lens';

export default {
  name: 'MarcframeExample',
  mixins: [LensMixin],
  data() {
    return {
    }
  },
  props: {
    example: {
      type: Object,
      default: null,
    },
  },
  methods: {
  },
  computed: {
    ...mapGetters(['entityReferences', 'settings', 'vocabContext', 'display', 'vocab']),
    source() {
      if (this.example.source) {
        return JSON.stringify(this.example.source, null, 2);
      }
      return null;
    },
    normalized() {
      if (this.example.normalized) {
        return JSON.stringify(this.example.normalized, null, 2);
      }
      return null;
    },
    result() {
      if (this.example.result) {
        return JSON.stringify(this.example.result, null, 2);
      }
      return null;
    },
  },
  components: {
  },
}
</script>

<style lang="scss">
.MarcframeExample {
  margin-bottom: 1em;
  border: 1px solid $gray-300;
  &-header {
    padding: 1em;
    font-weight: 500;
  }
  &-label {

  }
  &-body {
    padding: 1em;
    @media (min-width: 992px) {
      display: grid;
      grid-auto-columns: 1fr;
      grid-auto-flow: column;
    }
  
    > * {
      overflow: hidden;
    }
    > div {
      display: flex;
      flex-direction: column;
    }
    pre {
      padding: 0.25em;
      border: 1px solid $gray-300;
      width: auto;
      white-space: pre-wrap;
      flex-grow: 1;
      margin: 0.25em 0 0 0.25em;
      display: block;
      background-color: $gray-100;
    }
  }
}
</style>
