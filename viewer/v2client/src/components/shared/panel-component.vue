<script>
/* 

  HOW TO USE:
  This component can recieve content to inject in the different slots.

  The slots are:
    * panel-header  - If no content, will just show the "title"-prop and a close-button, explained below.
    * panel-body    - Just a container for your content. Supports highly customized layout.

  Close-event:
    The default close button will emit an event called "close".
    Listen to it in the parent with @close="callSomeFunction"

    Example:
      <panel-component title="My nice panel" v-if="panelActive" @close="panelActive=false"></panel-component>

*/
import * as LayoutUtil from '@/utils/layout';
import * as StringUtil from '@/utils/string';
import { mapGetters } from 'vuex';

export default {
  name: 'panel-component',
  props: {
    title: {
      default: 'Untitled panel',
      type: String,
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
      fadeTime: 500,
    }
  },
  methods: {
    lockScroll(boolValue) {
      LayoutUtil.scrollLock(boolValue);
    },
    toggleFullView() {
      const user = this.user;
      user.settings.forceFullViewPanel = !user.settings.forceFullViewPanel;
      this.$store.dispatch('setUser', user);
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
    ]),
    translatedTitle() {
      return StringUtil.getUiPhraseByLang(this.title, this.user.settings.language);
    },
  },
  components: {
  },
  mounted() {
    this.$nextTick(() => {
      this.$store.dispatch('setInspectorStatusValue', { property: 'panelOpen', value: true });
      setTimeout(() => {
        this.fadedIn = true;
      }, 1);
    });
  },
  beforeDestroy() {
    this.$nextTick(() => {
      this.$store.dispatch('setInspectorStatusValue', { property: 'panelOpen', value: false });
    });
  },
};
</script>

<template>
  <div class="PanelComponent"
  v-on:mouseenter="lockScroll(true)"
  v-on:mouseleave="lockScroll(false)"
  :class="{'is-fadedIn': fadedIn, 'is-danger': modalType === 'danger'}"
  >
    <div class="PanelComponent-container" :class="{'full-view': user.settings.forceFullViewPanel }">
      <div class="PanelComponent-header">
        <slot name="panel-header">
          <header>
            {{ translatedTitle }}
          </header>
          <span class="PanelComponent-windowControl">
            <i @click="toggleFullView" v-show="user.settings.forceFullViewPanel" class="fullview-toggle-button fa fa-minus-square"></i>
            <i @click="toggleFullView" v-show="!user.settings.forceFullViewPanel" class="fullview-toggle-button fa fa-plus-square"></i>
            <i @click="close" class="fa fa-close"></i>
          </span>
        </slot>
      </div>
      <div class="PanelComponent-body">
        <slot name="panel-body">
          <code>No content recieved from parent</code>
        </slot>
      </div>
    </div>
  </div>
</template>

<style lang="less">

.PanelComponent {
  cursor: auto;
  &-backdrop {
    .is-fadedIn & {
      opacity: 1;
    }
    opacity: 0;
    transition: opacity 0.5s ease;
    z-index: @backdrop-z;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.25);
  }
  &-container {
    .is-fadedIn & {
      opacity: 1;
    }
    opacity: 0;
    transition: opacity 0.5s ease;
    z-index: @modal-z;
    box-shadow: 0px 5px 15px 0px rgba(0,0,0,0.4);
    position: fixed;
    width: 35%;
    top: 0;
    left: 65%;
    height: 100vh;
    text-align: left;
    border: solid darken(@brand-primary, 5%);
    border-width: 0px 0px 0px 1px;
    .is-danger & {
      border-color: darken(@brand-danger, 5%);
    }
    background-color: @neutral-color;
    overflow: hidden;
    line-height: 1.6;
    @media screen and (max-width: @screen-lg-min) {
      .full-view();
    }
    &.full-view {
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100vh;
    }
  }
  &-header {
    .is-danger & {
      background-color: @brand-danger;
    }
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    justify-content: space-between;
    background-color: @brand-primary;
    color: @neutral-color;
    padding: 0.5em;
    header {
      display: inline-block;
      font-weight: bold;
      text-transform: uppercase;
    }
  }
  &-body {
    overflow-y: auto;
    height: 100%;
    z-index: 5;
  }
  &-windowControl {
    i:hover {
      cursor: pointer;
      color: darken(@neutral-color, 25%);
    }
    .fullview-toggle-button {
      @media screen and (max-width: @screen-lg-min) {
        display: none;
      }
    }
  }
}


</style>
