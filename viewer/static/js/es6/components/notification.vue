<script>
import { getNotification } from '../vuex/getters';
import { changeNotification } from '../vuex/actions';

export default {
  name: 'notification',
  vuex: {
    actions: {
      changeNotification,
    },
    getters: {
      notification: getNotification,
    },
  },
  data() {
    return {
      minTTL: 1000,
      maxTTL: 6000,
      padTTL: 500,
    }
  },
  watch: {
    notification: {
      handler() {
        if (this.notification.active === true) {
          let TTL = (this.notification.message.length * 100) + this.padTTL;
          if (TTL > this.maxTTL) {
            TTL = this.maxTTL;
          } else if (TTL < this.minTTL) {
            TTL = this.minTTL;
          }
          setTimeout(() => {
            this.changeNotification('active', false);
          }, TTL);
        }
      },
      deep: true,
    },
  },
};
</script>

<template>
  <div class="notification-container"
    :class="{
      'show-notification': notification.active
    }">
      <div class="notification" :class="{
        'red': notification.color === 'red',
        'grey': notification.color === 'grey',
        'green': notification.color === 'green'
          }">

          <span v-if="notification.color === 'red'" class="fa-stack fa-lg notification-icon-container">
            <i class="fa fa-circle fa-stack-2x fa-inverse"></i>
            <i class="fa fa-times fa-stack-1x notification-icon"></i>
          </span>
          <span v-if="notification.color === 'green'" class="fa-stack fa-lg notification-icon-container">
            <i class="fa fa-circle fa-stack-2x fa-inverse"></i>
            <i class="fa fa-check fa-stack-1x notification-icon"></i>
          </span>
          <span v-if="notification.color === 'grey'" class="fa-stack fa-lg notification-icon-container">
            <i class="fa fa-circle fa-stack-2x fa-inverse"></i>
            <i class="fa fa-info fa-stack-1x notification-icon"></i>
          </span>
        {{ notification.message }}
      </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

@error-color: rgb(206, 104, 104);
@success-color: @brand-primary;
@info-color: #757575;

.notification-container {
  position: fixed;
  bottom: -40%;
  left: 25%;
  width: 50%;
  z-index: @notification-z;
  transition: all ease 0.5s;
  .notification {
    width: 100%;
    border-radius: 0.3em;
    padding: 1em;
    font-weight: bold;
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.6);
    color: white;
    .notification-icon-container {
      margin-right: 0.5em;
    }
    &.red {
      background-color: @error-color;
      .notification-icon {
        color: @error-color;
      }
    }
    &.grey {
      background-color: @info-color;
      .notification-icon {
        color: @info-color;
      }
    }
    &.green {
      background-color: @success-color;
      .notification-icon {
        color: @success-color;
      }
    }
  }
  &.show-notification {
    opacity: 1;
    bottom: 15%;
  }
  > div {
    text-align: center;
  }
}


</style>
