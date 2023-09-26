<script>
import { mapActions, mapState, mapWritableState } from 'pinia';
import { translatePhrase } from '@/utils/filters';
import { useResourcesStore } from '@/stores/resources';
import { useSettingsStore } from '@/stores/settings';
import { useStatusStore } from '@/stores/status';
import { useUserStore } from '@/stores/user';
import moment from 'moment';

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
    ...mapState(useUserStore, ['user']),
    ...mapState(useStatusStore, ['userIdle']),
    ...mapState(useResourcesStore, ['activeGlobalMessages']),
    ...mapState(useSettingsStore, ['settings']),
    ...mapWritableState(useResourcesStore, ['globalMessages']),
    shownMessages() {
      return this.activeGlobalMessages;
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
    ...mapActions(useUserStore, ['dismissMessage', 'cleanupDismissedList']),
    getTimeSinceLastUpdate() {
      const now = moment();
      const lastUpdate = moment(this.timeForLastFetch);
      return now.diff(lastUpdate, 'seconds');
    },
    initializeUpdateTriggers() {
      setTimeout(() => {
        this.shouldFetch = true;
      }, 250);
      setInterval(() => {
        if (this.userIdle === false && this.getTimeSinceLastUpdate() > this.secondsBetweenUpdates) {
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
              this.globalMessages = body;
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
    <div class="GlobalMessage"
      :class="{
        'warning': message.content.type === 'warning',
        'info': message.content.type === 'info',
      }"
      :key="message.id"
      v-for="message in shownMessages"
    >
      <div class="GlobalMessage-banner"
        :class="{
          'container': user.settings.fullSiteWidth === false,
          'container-fluid': user.settings.fullSiteWidth,
        }"
      >
        <div class="GlobalMessage-icon">
          <span class="fa-stack fa-2x">
            <font-awesome-icon :icon="['fas', 'circle']" class="fa-stack-2x" />
            <font-awesome-icon v-if="message.content.type == 'warning'" :icon="['fas', 'triangle-exclamation']" class="fa-stack1x fa-inverse" />
            <font-awesome-icon v-if="message.content.type == 'info'" :icon="['fas', 'info']" class="fa-stack-1x fa-inverse" />
          </span>
        </div>
        <div class="GlobalMessage-content">
          <span class="GlobalMessage-title">{{ message.content.title }}</span>
          <span class="GlobalMessage-text" v-html="message.content.text"></span>
        </div>
        <div class="GlobalMessage-action">
          <button v-if="message.dismissable" @click="closeMessage(message.id)" @keyup.enter="closeMessage(message.id)" class="btn btn-transparent">{{ translatePhrase('Close') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
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
    color: $black;
    font-weight: bold;
    a {
      color: $black;
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
    color: $black;
    text-shadow: none;
    .icon-backplate {
      color: #c1516c;
    }
    .icon-symbol {
      color: #f9bec0;
    }

    a {
      color: $black;
      text-decoration: underline;
    }
  }
  &.info {
    background-color: #ceddef;
    border-color: darken(#ceddef, 5%);
    font-size: 20px;
    font-size: 2.0rem;
    font-weight: normal;
    color: $black;
    text-shadow: none;
    .icon-backplate {
      color: #236fc8;
    }
    .icon-symbol {
      color: #ceddef;
    }

    a {
      color: $black;
      text-decoration: underline;
    }
  }
}
</style>
