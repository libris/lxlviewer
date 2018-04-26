<script>
import { mapGetters } from 'vuex';

export default {
  name: 'summary-action-button',
  props: {
    options: {
      show: false,
      styling: 'gray',
      text: 'button',
      inspectAction: false,
    },
  },
  data() {
    return {
    }
  },
  methods: {
    action() {
      this.$emit('action');
    },
  },
  computed: {
    ...mapGetters([
      'settings',
    ]),
    inspectUrl() {
      const uriParts = this.options.payload['@id'].split('/');
      const fnurgel = uriParts[uriParts.length-1];
      return `/katalogisering/${fnurgel}`;
    },
    isLibrisResource() {
      if (this.options.payload['@id'].indexOf(this.settings.apiPath) > -1) {
        return true;
      }
      return false;
    }
  },
  components: {
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div class="action-container">
    <button
      @click="action()"
      :class="options.styling">
      {{options.text | translatePhrase}}
    </button>
    <!-- <a v-if="options.inspectAction && isLibrisResource" :href="inspectUrl" target="_blank" class="inspect-link">
      <i class="fa fa-external-link" aria-hidden="true"></i>
      {{"View" | translatePhrase}}
    </a>
    <a v-if="options.inspectAction && !isLibrisResource" :href="options.payload['@id']" target="_blank" class="inspect-link">
      <i class="fa fa-external-link" aria-hidden="true"></i>
      {{"View" | translatePhrase}}
    </a> -->
  </div>
</template>

<style lang="less">


.action-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 4px;
  padding: 0.5em;
  > a {
    margin-top: 0.8em;
  }
  > button {
    min-width: 90px;
    padding: 3px 10px;
    &.brand {
      color: @white;
      background: @brand-primary;
      &:hover {
        background: lighten(@brand-primary, 5%);
      }
      &:active {
        background: darken(@brand-primary, 5%);
      }
    }
    &.gray {
      color: @black;
      background: @gray-light;
      &:hover {
        background: lighten(@gray-light, 5%);
      }
      &:active {
        background: darken(@gray-light, 5%);
      }
    }
  }
}

</style>
