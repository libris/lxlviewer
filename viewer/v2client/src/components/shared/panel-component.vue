<script>
/* 

  HOW TO USE:
  This component can recieve content to inject in the different slots.

  The slots are:
    * panel-header        - If no content, will just show the "title"-prop and a close-button, explained below.
    * panel-header-info   - This will render additional inline information in the title, used for ! and ? icons.
    * panel-header-extra  - If you need something extra in the header, this will render below the other header-content.
    * panel-header-after  - If you need something sticky after the header, but outside the header container (ie grid, bg-color)
    * panel-body          - Just a container for your content. Supports highly customized layout.
    * panel-footer        - Optional footer content

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
      this.$store.dispatch('setStatusValue', { property: 'panelOpen', value: true });
      setTimeout(() => {
        this.fadedIn = true;
      }, 1);
    });
  },
  beforeDestroy() {
    this.$nextTick(() => {
      this.lockScroll(false);
      this.$store.dispatch('setStatusValue', { property: 'panelOpen', value: false });
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
      <div class="PanelComponent-headerContainer">
        <div class="PanelComponent-header">
          <slot name="panel-header">
            <div class="PanelComponent-titleContainer">
              <h4 class="PanelComponent-title">{{ translatedTitle }}</h4>
              <slot name="panel-header-info"></slot>
            </div>
            <span class="PanelComponent-windowControl">
              <i 
                @click="toggleFullView" 
                v-show="user.settings.forceFullViewPanel" 
                class="fullview-toggle-button fa fa-window-minimize icon icon--md"></i>
              <i 
                @click="toggleFullView" 
                v-show="!user.settings.forceFullViewPanel" 
                class="fullview-toggle-button fa fa-window-maximize icon icon--md"></i>
              <i @click="close" class="fa fa-close icon icon--md"></i>
            </span>
          </slot>
        </div>
        <slot name="panel-header-extra" />
      </div>
      <slot name="panel-header-after" />
      <div class="PanelComponent-body">
        <slot name="panel-body">
          <code>No content recieved from parent</code>
        </slot>
      </div>
      <div class="PanelComponent-footer">
        <slot name="panel-footer"></slot>
      </div>
    </div>
  </div>
</template>

<style lang="less">

.PanelComponent {
  cursor: auto;

  &-backdrop {
    opacity: 0;
    transition: opacity 0.5s ease;
    z-index: @backdrop-z;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    .is-fadedIn & {
      opacity: 1;
    }
  }

  &-container {
    opacity: 0;
    transition: opacity 0.5s ease;
    z-index: @modal-z;
    box-shadow: @shadow-card-elevated;
    position: fixed;
    width: 35%;
    top: 0;
    left: 65%;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .is-fadedIn & {
      opacity: 1;
    }

    .is-danger & {
      border-color: darken(@brand-danger, 5%);
    }

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

  &-headerContainer {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: column;
    background-color: @panel-header-bg;
    border-bottom: 1px solid @gray-lighter;
    padding: 20px 15px 0 15px;

    .is-danger & {
      background-color: @brand-danger;
      color: @neutral-color;
    }
  }

  &-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  &-headerInfo {
    margin-left: 15px;
  }

  &-headerInfoBox {
    position: absolute;
    display: flex;
    flex-direction: column;
    background-color: @white;
    border: 1px solid @gray-light;
    border-radius: 4px;
    box-shadow: @shadow-panel;
    padding: 10px;
    z-index: 1;
    max-width: 50%;
    font-size: 14px;
    font-size: 1.4rem;
    line-height: 1.6;

    & .header {
      font-weight: 600;
    }
  }

  &-titleContainer {
    display: flex;
    align-items: baseline;
  }

  &-title {
    font-size: 18px;
    font-size: 1.8rem;
    text-transform: uppercase;
    margin-top: 4px;
  }

  &-body {
    flex: 1;
    overflow-y: auto;
    height: 100%;
    // z-index: 5;
    background-color: @white;
  }

  &-searchStatus {
    padding: 20px;
    display: flex;    
    flex-direction: column;
    align-items: center;
    font-size: 20px;
    font-size: 2rem;
    font-weight: normal;
    color: @grey;
  }

  &-footer {
    background-color: @panel-header-bg;
    padding: 10px 15px;
    border-top: 1px solid @gray-light;
  }

  &-windowControl {
    > * {
      margin-right: 5px;
    }

    .fullview-toggle-button {
      @media screen and (max-width: @screen-lg-min) {
        display: none;
      }
    }
  }
}




</style>
