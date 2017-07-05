<script>
import * as LayoutUtil from '../utils/layout';
import { getStatus } from '../vuex/getters';
import { changeStatus } from '../vuex/actions';

export default {
  name: 'help-component',
  data() {
    return {
      openAll: 'open-all',
    }
  },
  vuex: {
    actions: {
      changeStatus,
    },
    getters: {
      status: getStatus,
    },
  },
  methods: {
    hide() {
      this.changeStatus('showHelp', false);
      LayoutUtil.scrollLock(false);
      this.changeStatus('keybindState', 'overview');
    },
  },
  events: {
    'close-modals'() {
      this.hide();
      return true;
    },
  },
  computed: {
    helpSection() {
      return this.status.helpSection;
    },
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
  <div class="help-component">
      <div class="window"  v-show="status.showHelp">
        <div class="header">
          <span class="title">
            {{ "Help" | translatePhrase }}
          </span>
          <span class="windowControl">
            <i v-on:click="hide" class="fa fa-close"></i>
          </span>
        </div>
        <div class="body">
          <div v-show="openAll || status.helpSection === 'editor-overview'">
            <h1>Redigering</h1>
            <p>Lorem ipsum</p>
          </div>
          <div v-show="openAll || status.helpSection === 'linked-entities'">
            <h1>Länkade entiteter</h1>
            <p>linked data or die</p>
          </div>
          <div v-show="openAll || status.helpSection === 'entity-search'">
            <h1>Entitetsök</h1>
            <p>Ipsum lorem</p>
          </div>
          <div v-show="openAll || status.helpSection === 'entity-search'">
            <h1>Entitetsök</h1>
            <p>Ipsum lorem</p>
          </div>
          <div v-show="openAll || status.helpSection === 'entity-search'">
            <h1>Entitetsök</h1>
            <p>Ipsum lorem</p>
          </div>
          <div v-show="openAll || status.helpSection === 'entity-search'">
            <h1>Entitetsök</h1>
            <p>Ipsum lorem</p>
          </div>
        </div>
      </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.help-component {
  .window {
    .window-mixin();
    .body {
      padding: 1em 2em 4em;
      overflow-y: scroll;
    }
  }
}

</style>
