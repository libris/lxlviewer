<script>
import { getNotification } from '../vuex/getters';
import { changeNotification } from '../vuex/actions';

export default {
  name: 'notifications',
  vuex: {
    actions: {
      changeNotification,
    },
    getters: {
      notification: getNotification,
    },
  },
  watch: {
    notification: {
      handler() {
        if (this.notification.message !== '') {
          setTimeout(() => {
            this.changeNotification('message', '');
          }, 3000);
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
      'show-notification': notification.message.length > 0,
      'red': notification.color === 'red',
      'grey': notification.color === 'grey',
      'green': notification.color === 'green'
    }">
      <div>
        {{ notification.message }}
      </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';
.notification-container {
  position: fixed;
  right: 20px;
  bottom: -60px;
  width: 200px;
  min-height: 50px;
  border-radius: 2px;
  padding: 5px 10px;
  font-size: medium;
  opacity: 0;
  transition: all ease 0.5s;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  &.show-notification {
    opacity: 1;
    bottom: 20px;
  }
  &.red {
    background-color: #d32f2f;
  }
  &.grey {
    background-color: #757575;
  }
  &.green {
    background-color: #388e3c;
  }
  > div {
    text-align: center;
  }
}


</style>
