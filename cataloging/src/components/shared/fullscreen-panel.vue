<script>
/*

  HOW TO USE:
  This component can recieve content to inject in the different slots.

  The slots are:
    * panel-content        - the content

  Close-event:
    The default close button will emit an event called "close".
    Listen to it in the parent with @close="callSomeFunction"

    Example:
      <panel-component title="My nice panel" v-if="panelActive" @close="panelActive=false"></panel-component>

*/
import { mapGetters } from 'vuex';
import * as StringUtil from 'lxljs/string';
import * as LayoutUtil from '@/utils/layout';

export default {
  name: 'panel-component',
  props: {
    title: {
      default: 'Untitled panel',
      type: String,
    },
    query: {
      type: Object,
      default: null,
    },
    modalType: {
      default: 'normal',
      type: String,
    },
    closeable: {
      default: true,
      type: Boolean,
    },
  },
  data() {
    return {
      fadedIn: false,
      fadeTime: 300,
    };
  },
  emits: ['close'],
  methods: {
    lockScroll(boolValue) {
      LayoutUtil.scrollLock(boolValue);
    },
    gotoSearch() {
      this.$router.push({ path: '/search/', query: this.query });
    },
    toggleFullView() {
      const user = this.user;
      user.settings.forceFullViewPanel = !user.settings.forceFullViewPanel;
      this.$store.dispatch('setUser', user);
      this.lockScroll(user.settings.forceFullViewPanel);
    },
    close() {
      if (this.closeable) {
        this.fadedIn = false;

        setTimeout(() => {
          this.$emit('close');
        }, this.fadeTime);
      }
    },
  },
  computed: {
    ...mapGetters([
      'user',
      'settings',
      'status',
      'resources',
    ]),
    translatedTitle() {
      return StringUtil.getUiPhraseByLang(this.title, this.user.settings.language, this.resources.i18n);
    },
  },
  watch: {
    'status.keyActions'(actions) {
      const lastAction = actions.slice(-1).join();
      if (lastAction === 'close-modals') {
        this.close();
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.$store.dispatch('setStatusValue', { property: 'fullScreenPanelOpen', value: true });
      if (this.status.panelOpen) {
        this.$store.dispatch('setStatusValue', {
          property: 'keybindState',
          value: 'fullscreen-panel-open',
        });
      }
      this.lockScroll(true);
      setTimeout(() => {
        this.fadedIn = true;
      }, 1);
    });
  },
  beforeUnmount() {
    this.$nextTick(() => {
      this.lockScroll(false);
      if (this.status.panelOpen) {
        this.$store.dispatch('setStatusValue', { property: 'fullScreenPanelOpen', value: false });
      }
    });
  },
};
</script>

<template>
  <div
    class="FullScreenPanel"
    :class="{ 'is-fadedIn': fadedIn, 'is-danger': modalType === 'danger' }"
    role="complementary">
    <slot name="content" />
  </div>
</template>

<style lang="less">

.FullScreenPanel {
  z-index: @fullscreenpanel-z;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: @bg-site;
}

</style>
