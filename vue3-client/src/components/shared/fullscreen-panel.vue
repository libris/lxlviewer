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
import * as StringUtil from 'lxljs/string';
import * as LayoutUtil from '@/utils/layout';
import { mapState, mapWritableState } from 'pinia';
import { useResourcesStore } from '@/stores/resources';
import { useStatusStore } from '@/stores/status';
import { useUserStore } from '@/stores/user';
import { useSettingsStore } from '@/stores/settings';

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
      this.user = user;
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
    ...mapState(useResourcesStore, ['i18n']),
    ...mapState(useStatusStore, ['keyActions', 'panelOpen']),
    ...mapWritableState(useStatusStore, ['keybindState', 'fullScreenPanelOpen']),
    ...mapWritableState(useUserStore, ['user']),
    ...mapState(useSettingsStore, ['settings']),
    translatedTitle() {
      return StringUtil.getUiPhraseByLang(this.title, this.user.settings.language, this.i18n);
    },
  },
  watch: {
    'keyActions'(actions) {
      const lastAction = actions.slice(-1).join();
      if (lastAction === 'close-modals') {
        this.close();
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.fullScreenPanelOpen = true;
      if (this.panelOpen) {
        this.keybindState = 'fullscreen-panel-open';
      }

      this.lockScroll(true);
      setTimeout(() => {
        this.fadedIn = true;
      }, 1);
    });
  },
  beforeDestroy() {
    this.$nextTick(() => {
      this.lockScroll(false);
      if (this.panelOpen) {
        this.fullScreenPanelOpen = false;
      }
    });
  },
};
</script>

<template>
  <div class="FullScreenPanel"
  :class="{'is-fadedIn': fadedIn, 'is-danger': modalType === 'danger'}"
  role="complementary">
    <slot name="content"></slot>
  </div>
</template>

<style lang="scss">

.FullScreenPanel {
  z-index: $fullscreenpanel-z;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: $bg-site;
  overflow: scroll;
}

</style>
