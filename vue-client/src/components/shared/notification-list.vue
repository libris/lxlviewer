<script>
import { useStatusStore } from '@/stores/status';
import { mapState } from 'pinia';

import Notification from '@/components/shared/notification.vue';

export default {
  name: 'notification-list',
  computed: {
    ...mapState(useStatusStore, ['notifications']),
  },
  components: {
    notification: Notification,
  },
};
</script>

<template>
  <div class="NotificationList">
    <notification
      v-for="notification in notifications"
      :content="notification"
      :key="notification.id"
      class="NotificationList-item"
    />
  </div>
</template>

<style lang="scss">

.NotificationList {
  position: fixed;
  bottom: 0;
  padding: 0px;
  left: 25%;
  width: 50%;
  z-index: $notification-z;
  transition: all ease 0.5s;
  text-align: center;
}

</style>
