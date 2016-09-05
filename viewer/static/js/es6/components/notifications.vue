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
    formattedDate: function(date) {
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
      <li v-for="msg in messages" track-by="$index" v-bind:class="{'success': msg.type == 'success', 'error': msg.type == 'error'}">
        [{{ formattedDate(msg.time) }}] <b>{{msg.title}}</b>: {{msg.msg}} <a class="pull-right" v-on:click="remove($index)"><i class="fa fa-times"></i></a>
      </li>
    </ul>
  </div>
</template>
