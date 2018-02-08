<script>
import Notification from '@/components/shared/notification';

export default {
  name: 'notification-list',
  methods: {
  },
  computed: {
    notifications() {
      return this.$store.getters.status.notifications;
    }
  },
  components: {
    'notification': Notification
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div class="notification-list">
    <notification v-for="notification in notifications" :content="notification" :key="notification.id"></notification>
  </div>
</template>

<style lang="less">

.notification-list {
  position: fixed;
  bottom: 0;
  padding: 0px 0px 3em 0px;
  left: 25%;
  width: 50%;
  z-index: @notification-z;
  transition: all ease 0.5s;
  text-align: center;
}

</style>
