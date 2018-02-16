<script>
/* 

  HOW TO USE:
  This component can recieve content to inject in the different slots.

  The slots are:
    * modal-header  - If no content, will just show the "title"-prop and a close-button, explained below.
    * modal-body    - Just a container for your content. Supports highly customized layout.

  Close-event:
    The default close button (and click on backdrop) will emit an event called "close".
    Listen to it in the parent with @close="callSomeFunction"

    Example:
      <modal-component title="My nice modal" v-if="modalActive" @close="modalActive=false"></modal-component>

*/
import * as LayoutUtil from '@/utils/layout';

export default {
  name: 'modal-component',
  props: {
    title: {
      default: 'Untitled modal',
      type: String,
    },
  },
  data() {
    return {
      fadedIn: false,
      fadeTime: 500,
    }
  },
  methods: {
    close() {
      this.fadedIn = false;
      setTimeout(() => {
        this.$emit('close');
      }, this.fadeTime);
    },
  },
  computed: {
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
  beforeDestroy() {
    this.$nextTick(() => {
      LayoutUtil.scrollLock(false);
    });
  },
};
</script>

<template>
  <div class="ModalComponent" :class="{'is-fadedIn': fadedIn}">
    <div class="ModalComponent-backdrop" @click="close"></div>
    <div class="ModalComponent-container">
      <div class="ModalComponent-header">
        <slot name="modal-header">
          <header>
            {{ title }}
          </header>
          <span class="ModalComponent-windowControl">
            <i @click="close" class="fa fa-close"></i>
          </span>
        </slot>
      </div>
      <slot name="modal-body">
        <code>No content recieved from parent</code>
      </slot>
    </div>
  </div>
</template>

<style lang="less">

.ModalComponent {
  &-backdrop {
    .is-fadedIn & {
      opacity: 1;
    }
    opacity: 0;
    transition: opacity 0.5s ease;
    z-index: @backdrop-z;
    position: absolute;
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
    display: flex;
    flex-direction: column;
    width: 80%;
    max-width: 900px;
    top: 10%;
    left: 0;
    right: 0;
    margin: 0 auto;
    min-width: 600px;
    height: 85%;
    text-align: left;
    border: 1px solid darken(@brand-primary, 5%);
    border-radius: 3px;
    background-color: @neutral-color;
    overflow: hidden;
    line-height: 1.6;
  }
  &-header {
    background-color: @brand-primary;
    color: @neutral-color;
    padding: 0.5em;
    header {
      font-weight: bold;
      display: inline-block;
      margin: 2px 0px 0px 5px;
      text-transform: uppercase;
    }
  }
  &-windowControl {
    float: right;
    padding: 1px 8px 0px 30px;
    display: inline-block;
    i:hover {
      cursor: pointer;
      color: darken(@neutral-color, 25%);
    }
  }
}


</style>
