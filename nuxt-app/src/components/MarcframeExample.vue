<template>
  <div class="MarcframeExample">
    <div class="MarcframeExample-header">{{ translateUi('Example') }}: {{ example.name ? example.name : '-' }}</div>
    <div class="MarcframeExample-body">
      <div v-if="source != null">
        <div class="MarcframeExample-label">MARC</div>
        <pre v-html="formatHighlight(source, jsonColors)"></pre>
      </div>
      <div v-if="normalized != null">
        <div class="MarcframeExample-label">Normalized MARC:<br>
        </div>
        <pre v-html="formatHighlight(normalized, jsonColors)"></pre>
      </div>
      <div v-if="result != null">
        <div class="MarcframeExample-label">JSON-LD</div>
        <pre v-html="formatHighlight(result, jsonColors)"></pre>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import LensMixin from '@/mixins/lens';
import formatHighlight from 'json-format-highlight';

export default {
  name: 'MarcframeExample',
  mixins: [LensMixin],
  data() {
    return {
      jsonColors: {
        keyColor: '#6b4a00',
        numberColor: '#045b69',
        stringColor: '#045b69',
        trueColor: '#045b69',
        falseColor: '#045b69',
        nullColor: '#045b69'
      },
    }
  },
  props: {
    example: {
      type: Object,
      default: null,
    },
  },
  methods: {
    formatHighlight(json, options) {
      return formatHighlight(json, options);
    },
  },
  computed: {
    ...mapGetters(['settings', 'vocabContext', 'display', 'vocab']),
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
      background-color: $white;
      box-shadow: inset 0em 0em 1em #0000000d;
    }
  }
}
</style>
