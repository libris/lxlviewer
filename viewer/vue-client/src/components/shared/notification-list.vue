<script>
import Notification from '@/components/shared/notification';

export default {
  name: 'notification-list',
  methods: {
  },
  computed: {
    notifications() {
      return this.$store.getters.status.notifications;
    },
  },
  components: {
    notification: Notification,
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div class="NotificationList">
    <notification v-for="notification in notifications" :content="notification" :key="notification.id" class="NotificationList-item"></notification>
  </div>
</template>

<style lang="less">

.NotificationList {
  position: fixed;
  bottom: 0;
  padding: 0px;
  left: 25%;
  width: 50%;
  z-index: @notification-z;
  transition: all ease 0.5s;
  text-align: center;
}

</style>
