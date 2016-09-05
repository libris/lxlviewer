<script>
import * as _ from 'lodash';
import Notifications from '../components/notifications';
import moment from 'moment';
import locale_sv from 'moment/locale/sv';
moment.locale('sv');

export default {
  props: [
    'status',
    'messages',
  ],
  methods: {
    save() {
      this.$dispatch('save-item');
    },
  },
  computed: {
    modified: function() {
      return {
        date: moment(this.status.modified).format('lll'),
        timeAgo: moment(this.status.modified).fromNow(),
      };
    },
    created: function() {
      return {
        date: moment(this.status.created).format('lll'),
        timeAgo: moment(this.status.created).fromNow(),
      };
    },
  },
  components: {
    'notifications': Notifications,
  },
};
</script>

<template>
  <div class="editor-controls container">
    <div class="row">
      <div class="col-md-4 col-md-offset-8">
        <notifications :messages="messages"></notifications>
      </div>
      <div class="col-md-12 controls-container">
        <div class="change-info pull-left">
          <span v-if="status.created" class="node">Skapad {{created.date}} <span class="time-ago">({{created.timeAgo}})</span></span>
          <span v-if="status.modified" class="node">Ändrad {{modified.date}} <span class="time-ago">({{modified.timeAgo}})</span></span>
        </div>
        <button id="saveButton" v-on:click="save()">
          <i class="fa fa-fw fa-cog fa-spin" v-show="status.saved.loading"></i>
          <i class="fa fa-fw fa-save" v-show="!status.saved.loading"></i>
          Spara
        </button>
      </div>
    </div>
  </div>
</template>
