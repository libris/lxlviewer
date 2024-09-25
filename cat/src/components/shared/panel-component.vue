<script>
/*

  HOW TO USE:
  This component can recieve content to inject in the different slots.

  The slots are:
    * panel-header        - If no content, will just show the "title"-prop and a close-button, explained below.
    * panel-header-info   - This will render additional inline information in the title, used for ! and ? icons.
    * panel-header-extra  - If you need something extra in the header, this will render below the other header-content.
    * panel-header-after  - If you need something sticky after the header, but outside the header container (with different grid, bg-color).
    * panel-body          - Just a container for your content. Supports highly customized layout.
    * panel-footer        - Optional footer content.

  Close-event:
    The default close button will emit an event called "close".
    Listen to it in the parent with @close="callSomeFunction"

    Example:
      <panel-component title="My nice panel" v-if="panelActive" @close="panelActive=false"></panel-component>

*/
import { mapGetters } from 'vuex';
import * as StringUtil from 'lxljs/string';
import * as LayoutUtil from '@/utils/layout';
import { translatePhrase } from '@/utils/filters';

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
    translatePhrase,
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
      this.$store.dispatch('setStatusValue', { property: 'panelOpen', value: true });
      if (this.status.panelOpen) {
        this.$store.dispatch('setStatusValue', {
          property: 'keybindState',
          value: 'panel-open',
        });
      }
      if (window.innerWidth <= 1200 || this.user.settings.forceFullViewPanel) {
        this.lockScroll(true);
      }
      setTimeout(() => {
        this.fadedIn = true;
      }, 1);
    });
  },
  beforeUnmount() {
    this.$nextTick(() => {
      this.lockScroll(false);
      if (this.status.panelOpen) {
        this.$store.dispatch('setStatusValue', { property: 'panelOpen', value: false });
      }
    });
  },
};
</script>

<template>
  <div
    class="PanelComponent"
    :class="{ 'is-fadedIn': fadedIn, 'is-danger': modalType === 'danger' }"
    role="complementary">
    <div class="PanelComponent-container" :class="{ 'full-view': user.settings.forceFullViewPanel }">
      <div class="PanelComponent-headerContainer">
        <div class="PanelComponent-header">
          <slot name="panel-header">
            <div class="PanelComponent-titleContainer">
              <h4 class="PanelComponent-title" :title="translatedTitle">{{ translatedTitle }}</h4>
              <slot name="panel-header-info" />
            </div>
            <span class="PanelComponent-windowControl">
              <i
                class="goto-search-button fa fa-search-plus icon icon--md"
                v-show="query != null"
                role="button"
                tabindex="0"
                @click="gotoSearch"
                :title="translatePhrase('Bring to main search')" />
              <i
                class="fullview-toggle-button fa fa-compress icon icon--md"
                v-show="user.settings.forceFullViewPanel"
                role="button"
                tabindex="0"
                @click="toggleFullView"
                :title="translatePhrase('Minimize')" />
              <i
                class="fullview-toggle-button fa fa-expand icon icon--md"
                v-show="!user.settings.forceFullViewPanel"
                role="button"
                tabindex="0"
                @click="toggleFullView"
                :title="translatePhrase('Expand')" />
              <i
                class="fa fa-close icon icon--md"
                role="button"
                tabindex="0"
                @click="close"
                :title="translatePhrase('Close')" />
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
        <slot name="panel-footer" />
      </div>
    </div>
  </div>
</template>

<style lang="less">

.PanelComponent {
  cursor: auto;

  // prevent panel content from inheriting styles from the element it's nested in...
  text-transform: initial;
  font-weight: initial;
  color: @black;

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
    z-index: @sidepanel-z;
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
    flex-shrink: 0;
    background-color: @panel-header-bg;
    border-bottom: 1px solid @grey-lighter;
    padding: 20px 15px 0 15px;

    .is-danger & {
      background-color: @brand-danger;
      color: @neutral-color;
    }
    input {
      background-color: #fff;
      border: 1px solid @grey-lighter;
      &:focus {
        border-color: @brand-primary;
      }
    }
  }

  &-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  &-headerInfo {
      margin-left: 10px;
  }

  &-headerInfoBox {
    position: absolute;
    display: flex;
    flex-direction: column;
    max-height: 100%;
    overflow: scroll;
    background-color: @white;
    border: 1px solid @grey-light;
    border-radius: 4px;
    box-shadow: @shadow-panel;
    padding: 10px;
    z-index: 4;
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
    min-width: 0;
  }

  &-title {
    font-size: 18px;
    font-size: 1.8rem;
    display: block;
    text-transform: uppercase;
    color: @grey-darker;
    margin-top: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-body {
    flex: 1;
    overflow-y: auto;
    height: 100%;
    background-color: @white;
  }

  &-searchStatus {
    padding: 15px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 20px;
    font-size: 2rem;
    font-weight: normal;
    color: @grey-dark;

    & > * {
      max-width: 500px;
      text-align: center;
    }
  }

  &-listItem {
    display: flex;
    width: 100%;
    padding: 15px;
    background-color: @list-item-bg-even;
    transition: background-color 0.2s ease;

    &:only-child {
      border: solid @grey-lighter;
      border-width: 0px 0px 1px 0px;
    }
    &:nth-child(odd) {
      background-color: @list-item-bg-odd;
    }
  }

  &-footer {
    background-color: @panel-header-bg;
    border-top: 1px solid @grey-lighter;
  }

  &-windowControl {
    display: flex;
    flex-wrap: nowrap;
    margin-left: 10px;
    > .fa {
      margin-right: 0.5em;
      &:last-child {
        margin-right: unset;
      }
    }

    .fullview-toggle-button {
      width: 20px;

      @media screen and (max-width: @screen-lg-min) {
        display: none;
      }
    }
  }
}

</style>
