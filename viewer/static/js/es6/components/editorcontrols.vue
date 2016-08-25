<script>
import * as _ from 'lodash';
import moment from 'moment';
import locale_sv from 'moment/locale/sv';
moment.locale('sv');

export default {
  props: {
    status,
  },
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
  },
};
</script>

<template>
  <div class="editor-controls container">
    <div class="row">
      <div class="col-md-12 controls-container">
        <div class="change-info pull-left">
          <span class="node">Skapad {{created.date}} <span class="time-ago">({{created.timeAgo}})</span></span>
          <span class="node">Ändrad {{modified.date}} <span class="time-ago">({{modified.timeAgo}})</span></span>
        </div>
        <button id="saveButton" :disabled="!status.dirty" v-on:click="save()">
          <i class="fa fa-fw fa-cog fa-spin" v-show="status.saved.loading"></i>
          <i class="fa fa-fw fa-save" v-show="!status.saved.loading"></i>
          Spara
        </button>
        <span class="status-text small" v-bind:class="{'error' : status.saved.status.error, 'success' : !status.saved.status.error }" v-show="!status.saved.loading && status.saved.status.info">{{ status.saved.status.info }}</span>
      </div>
    </div>
  </div>
</template>
