<script>

export default {
  name: 'notification',
  data() {
    return {
      TTL: 5000,
      shouldShow: false,
    }
  },
  props: ['content'],
  watch: {
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.shouldShow = true;
      }, 1);
      setTimeout(() => {
        this.shouldShow = false;
      }, this.TTL - 500);
      setTimeout(() => {
        this.remove();
      }, this.TTL);
    });
  },
  methods: {
    remove() {
      this.$store.dispatch('removeNotification', this.content.id);
    },
  }
};
</script>

<template>
  <div class="notification-component" @click="remove" :class="{
    'red': content.color === 'red',
    'grey': content.color === 'grey',
    'green': content.color === 'green',
    'is-showing': shouldShow
      }">

      <span v-if="content.color === 'red'" class="fa-stack fa-lg notification-icon-container">
        <i class="fa fa-circle fa-stack-2x fa-inverse"></i>
        <i class="fa fa-times fa-stack-1x notification-icon"></i>
      </span>
      <span v-if="content.color === 'green'" class="fa-stack fa-lg notification-icon-container">
        <i class="fa fa-circle fa-stack-2x fa-inverse"></i>
        <i class="fa fa-check fa-stack-1x notification-icon"></i>
      </span>
      <span v-if="content.color === 'grey'" class="fa-stack fa-lg notification-icon-container">
        <i class="fa fa-circle fa-stack-2x fa-inverse"></i>
        <i class="fa fa-info fa-stack-1x notification-icon"></i>
      </span>
    {{ content.message }}
  </div>
</template>

<style lang="less">

@error-color: rgb(206, 104, 104);
@success-color: @brand-primary;
@info-color: #757575;

.notification-component {
  opacity: 0;
  transition: opacity 0.5s ease;
  width: 100%;
  border-radius: 0.3em;
  padding: 1em;
  margin: 0.5em;
  font-weight: bold;
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.6);
  color: white;
  .notification-icon-container {
    margin-right: 0.5em;
  }
  &.is-showing {
    opacity: 1;
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


</style>
