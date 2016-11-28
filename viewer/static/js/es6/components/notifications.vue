<script>
import * as _ from 'lodash';
import moment from 'moment';
import locale_sv from 'moment/locale/sv';
moment.locale('sv');

/*
  This component shows messages from the applications list of messages.
  Example below. Can be called from any child of $root.

  this.$dispatch('show-message', {
    title: 'Your title',
    msg: 'Your message',
    type: 'success/error/',
  })
*/

export default {
  name: 'notifications',
  props: [
    'messages',
  ],
  computed: {
  },
  events: {
  },
  methods: {
    remove(index) {
      this.$dispatch('remove-message', index);
    },
    formattedDate(date) {
      return moment(date).format('LTS');
    },
  },
  components: {
  },
};
</script>

<template>
  <div class="notifications" v-show="messages.length > 0">
    <ul>
      <li v-for="msg in messages" v-on:click="remove($index)" track-by="$index" v-bind:class="{ 'success': msg.type == 'success', 'error': msg.type == 'error'}">
        <i class="msg-type fa fa-check" v-show="msg.type == 'success'"></i>
        <i class="msg-type fa fa-times" v-show="msg.type == 'error'"></i>
        <b>{{msg.title}}</b><span class="pull-right">[{{ formattedDate(msg.time) }}] </span>
        <p>{{msg.msg}}</p>
      </li>
    </ul>
  </div>
</template>

<style lang="less">
@import './variables.less';

.notifications {
  transition: 0.5s ease;
  transition-property: height;
  ul {
    li {
      background-color: rgba(0, 0, 0, 0.7);
      color: @neutral-color;
      margin: 10px 0px;
      padding: 7px 15px;
      font-size: 14px;
      transition: 1s ease opacity;
      a {
        cursor: pointer;
        font-weight: bold;
        color: inherit;
      }
      &.inactive {
        opacity: 0;
      }
      &.success {
        .msg-type {
          color: #00c300;
        }
      }
      &.error {
        .msg-type {
          color: #e60000;
        }
      }
    }
  }
}


</style>
