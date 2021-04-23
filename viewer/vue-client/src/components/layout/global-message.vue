<script>

export default {
  name: 'GlobalMessage',
  data() {
    return {
      closedByUser: false,
    };
  },
  props: {
    message: {
      type: Object,
      default: null,
    },
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    settings() {
      return this.$store.getters.settings;
    },
  },
};
</script>

<template>
  <div class="GlobalMessage top-scroll-past" id="GlobalMessage" v-if="!closedByUser" v-bind:class="{'warning':this.message.type === 'warning', 'info':this.message.type === 'info' }">
    <div class="GlobalMessage-banner" :class="{'container': user.settings.fullSiteWidth === false, 'container-fluid': user.settings.fullSiteWidth}">
      <div class="GlobalMessage-icon">
        <span class="fa-stack fa-md">
          <i class="icon-backplate fa fa-circle fa-stack-2x"></i>
          <i v-if="this.message.type == 'warning'" class="icon-symbol fa fa-exclamation fa-stack-1x fa-inverse"></i>
          <i v-if="this.message.type == 'info'" class="icon-symbol fa fa-info fa-stack-1x fa-inverse"></i>
        </span>
      </div>
      <div class="GlobalMessage-content">
        <span class="GlobalMessage-title">{{ message.title }}</span>
        <span class="GlobalMessage-text">{{ message.text }}</span>
      </div>
      <div class="GlobalMessage-action">
        <button @click="closedByUser = true" @keyup.enter="closedByUser = true" class="btn btn-transparent">{{ 'Close' | translatePhrase }}</button>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.GlobalMessage {
  border-style: solid;
  border-width: 1px 0px 0px 0px;
  &-banner {
    padding: 0.5em;
    display: flex;
    justify-content: space-between;
    color: @black;
    width: 100%;
    font-weight: bold;
    a {
      color: @black;
    }
    button {
      float: right;
    }
  }
  &-icon {
    display: flex;
    align-items: center;
  }
  &-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-grow: 1;
    font-size: 1.6rem;
    line-height: 1.4;
    padding: 0 1em;
  }
  &-action {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  &-title {
    font-weight: 600;
  }
  &-text {
    font-weight: 400;
  }

  &.warning {
    background-color: #f9bec0;
    border-color: darken(#f9bec0, 5%);
    font-size: 20px;
    font-size: 2.0rem;
    font-weight: normal;
    color: @black;
    text-shadow: none;
    .icon-backplate {
      color: #c1516c;
    }
    .icon-symbol {
      color: #f9bec0;
    }

    a {
      color: @black;
      text-decoration: underline;
    }
  }
  &.info {
    background-color: #ceddef;
    border-color: darken(#ceddef, 5%);
    font-size: 20px;
    font-size: 2.0rem;
    font-weight: normal;
    color: @black;
    text-shadow: none;
    .icon-backplate {
      color: #236fc8;
    }
    .icon-symbol {
      color: #ceddef;
    }

    a {
      color: @black;
      text-decoration: underline;
    }
  }
}
</style>
