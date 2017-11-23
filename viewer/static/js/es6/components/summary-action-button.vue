<script>
export default {
  name: 'summary-action-button',
  props: {
    settings: {
      show: false,
      styling: 'gray',
      text: 'button',
      event: '',
      payload: {},
      inspectAction: false,
    },
  },
  data() {
    return {
    }
  },
  methods: {
    triggerAction() {
      this.$dispatch(this.settings.event, this.settings.payload);
    }
  },
  computed: {
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
      @click="triggerAction()"
      :class="settings.styling"
      >
      {{settings.text | translatePhrase}}
    </button>
    <a v-if="settings.inspectAction" :href="settings.payload['@id']" target="_blank" class="inspect-link">
      <i class="fa fa-external-link" aria-hidden="true"></i>
      {{"View" | translatePhrase}}
    </a>
  </div>
</template>

<style lang="less">
@import './_variables.less';

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
