<script>
import { mapGetters, mapActions } from 'vuex';
import { translatePhrase } from '@/utils/filters';

export default {
  name: 'GlobalMessages',
  data() {
    return {
      secondsBetweenUpdates: 60,
      timeForLastFetch: null,
      shouldFetch: false,
    };
  },
  props: {
    message: {
      type: Object,
      default: null,
    },
  },
  computed: {
    ...mapGetters([
      'settings',
      'user',
      'status',
      'activeGlobalMessages',
    ]),
    shownMessages() {
      return this.activeGlobalMessages;
    },
    settings() {
      return this.$store.getters.settings;
    },
  },
  watch: {
    shouldFetch(val, oldVal) {
      if (val !== oldVal && val === true) {
        this.fetchGlobalMessages();
      }
    },
  },
  methods: {
    translatePhrase,
    ...mapActions([
      'setGlobalMessages',
      'dismissMessage',
      'cleanupDismissedList',
    ]),
    getTimeSinceLastUpdate() {
      return Math.floor((new Date().getTime() - this.timeForLastFetch.getTime()) / 1000);
    },
    initializeUpdateTriggers() {
      setTimeout(() => {
        this.shouldFetch = true;
      }, 250);
      setInterval(() => {
        if (this.status.userIdle === false && this.getTimeSinceLastUpdate() > this.secondsBetweenUpdates) {
          this.shouldFetch = true;
        }
      }, 10000);
    },
    closeMessage(id) {
      this.dismissMessage(id);
      this.cleanupDismissedList();
    },
    fetchGlobalMessages() {
      this.shouldFetch = false;
      this.timeForLastFetch = new Date();
      fetch(`${this.settings.apiPath}/feed/status`).then((result) => {
        if (result.status === 200) {
          result.json().then((body) => {
            setTimeout(() => {
              this.setGlobalMessages(body);
            }, 1000);
          });
        }
      }, (error) => {
        console.log('Couldn\'t fetch status feed.', error);
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initializeUpdateTriggers();
    });
  },
};
</script>

<template>
  <div class="GlobalMessages top-scroll-past" id="GlobalMessages">
    <div
      class="GlobalMessage"
      :class="{
        warning: message.content.type === 'warning',
        info: message.content.type === 'info',
      }"
      :key="message.id"
      v-for="message in shownMessages"
    >
      <div
        class="GlobalMessage-banner"
        :class="{
          container: user.settings.fullSiteWidth === false,
          'container-fluid': user.settings.fullSiteWidth,
        }"
      >
        <div class="GlobalMessage-icon">
          <span class="fa-stack fa-md">
            <i class="icon-backplate fa fa-circle fa-stack-2x" />
            <i v-if="message.content.type == 'warning'" class="icon-symbol fa fa-exclamation fa-stack-1x fa-inverse" />
            <i v-if="message.content.type == 'info'" class="icon-symbol fa fa-info fa-stack-1x fa-inverse" />
          </span>
        </div>
        <div class="GlobalMessage-content">
          <span class="GlobalMessage-title">{{ message.content.title }}</span>
          <span class="GlobalMessage-text" v-html="message.content.text" />
        </div>
        <div class="GlobalMessage-action">
          <button
            v-if="message.dismissable"
            @click="closeMessage(message.id)"
            @keyup.enter="closeMessage(message.id)"
            class="btn btn-transparent">{{ translatePhrase('Close') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.GlobalMessage {
  border-style: solid;
  padding: 0.5em;
  width: 100%;
  border-width: 1px 0px 0px 0px;
  &:first-child {
    border-width: 0px;
  }
  &-banner {
    display: flex;
    justify-content: space-between;
    color: @black;
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
