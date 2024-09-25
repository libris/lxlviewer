<script>
/*

  HOW TO USE:
  This component can recieve content to inject in the different slots.

  Props:
    * title         - Takes a string or an array of strings. Will try to translate into user language.
    * width         - Width value

  The slots are:
    * modal-header  - If no content, will just show the "title"-prop and a close-button, explained below.
    * modal-body    - Just a container for your content. Supports highly customized layout.
    * modal-fooder  - Will not render anything if not provided

  Close-event:
    The default close button (and click on backdrop) will emit an event called "close".
    Listen to it in the parent with @close="callSomeFunction"

    Example:
      <modal-component title="My nice modal" v-if="modalActive" @close="modalActive=false"></modal-component>

*/

import { isArray } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as StringUtil from 'lxljs/string';
import * as LayoutUtil from '@/utils/layout';

export default {
  name: 'modal-component',
  props: {
    title: {
      default: 'Untitled modal',
      type: [String, Array],
    },
    modalType: {
      default: 'normal',
      type: String,
    },
    closeable: {
      default: true,
      type: Boolean,
    },
    width: {
      default: '',
      type: String,
    },
    backdropClose: {
      type: Boolean,
      default: true,
    },
    top: {
      default: '',
      type: String,
    },
  },
  data() {
    return {
      fadedIn: false,
      fadeTime: 500,
    };
  },
  emits: ['close'],
  methods: {
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
      'status',
      'resources',
    ]),
    translatedTitle() {
      let title = '';
      if (isArray(this.title)) {
        for (let i = 0; i < this.title.length; i++) {
          title = `${title}${StringUtil.getUiPhraseByLang(this.title[i], this.user.settings.language, this.resources.i18n)} `;
        }
      } else {
        title = StringUtil.getUiPhraseByLang(this.title, this.user.settings.language, this.resources.i18n);
      }
      return title;
    },
  },
  components: {
  },
  mounted() {
    this.$nextTick(() => {
      LayoutUtil.scrollLock(true);
      setTimeout(() => {
        this.fadedIn = true;
      }, 1);
    });
  },
  beforeUnmount() {
    this.$nextTick(() => {
      LayoutUtil.scrollLock(false);
    });
  },
  watch: {
    'status.keyActions'(actions) {
      const lastAction = actions.slice(-1).join();
      if (lastAction === 'close-modals') {
        this.close();
      }
    },
  },
};
</script>

<template>
  <div class="ModalComponent" :class="{ 'is-fadedIn': fadedIn, 'is-danger': modalType === 'danger', 'is-warning': modalType === 'warning' }">
    <div class="ModalComponent-backdrop" @click="backdropClose ? close() : null" />
    <div class="ModalComponent-container" :style="{ width: width, top: top }">
      <div class="ModalComponent-header">
        <slot name="modal-header">
          <header>
            {{ translatedTitle }}
          </header>
          <span class="ModalComponent-windowControl" v-if="closeable">
            <i
              @click="close"
              role="button"
              tabindex="0"
              class="fa fa-close icon--md" />
          </span>
        </slot>
      </div>
      <div class="ModalComponent-body">
        <slot name="modal-body">
          <code>No content recieved from parent</code>
        </slot>
      </div>
      <div class="ModalComponent-footer">
        <slot name="modal-footer" />
      </div>
    </div>
  </div>
</template>

<style lang="less">

.ModalComponent {
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
    background-color: @modal-backdrop-background;
  }

  &-container {
    .is-fadedIn & {
      opacity: 1;
    }
    opacity: 0;
    transition: opacity 0.5s ease;
    z-index: @modal-z;
    box-shadow: @modal-container-shadow;
    position: fixed;
    width: 900px;
    max-width: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: left;
    border-radius: 4px;
    background-color: @modal-body-background;
    line-height: 1.6;
  }

  &-header {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    justify-content: space-between;
    border: solid @grey-light;
    border-width: 0px 0px 1px 0px;
    background-color: @modal-header-background;
    color: @black;
    padding: 1.5rem 2rem;

    header {
      font-size: 1.8rem;
      display: inline-block;
      font-weight: 600;
    }
  }

  &-body {
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    display: flex;
    background-color: @modal-body-background;
    flex-direction: column;
    align-items: center;
    z-index: 5;
  }

  &-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 6;
  }

  &-windowControl {
    i:hover {
      cursor: pointer;
    }
  }
}

</style>
