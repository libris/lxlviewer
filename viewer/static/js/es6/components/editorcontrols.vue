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
    'editor-data',
  ],
  methods: {
    save() {
      this.$dispatch('save-item');
    },
  },
  computed: {
    modified: function() {
      return {
        date: moment(this.editorData.record.modified).format('lll'),
        timeAgo: moment(this.editorData.record.modified).fromNow(),
      };
    },
    created: function() {
      return {
        date: moment(this.editorData.record.created).format('lll'),
        timeAgo: moment(this.editorData.record.created).fromNow(),
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
        <!-- <notifications :messages="messages"></notifications> -->
      </div>
      <div class="col-md-12 controls-container">
        <div class="change-info pull-left">
          <span v-if="editorData.record.created" class="node">Skapad {{created.date}} <span class="time-ago">({{created.timeAgo}})</span></span>
          <span v-if="editorData.record.modified" class="node">Ändrad {{modified.date}} <span class="time-ago">({{modified.timeAgo}})</span></span>
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

<style lang="less">

.editor-controls {
  .row {
    margin: 0px;
  }
  position: fixed;
  bottom: 0px;
  left: 0px;
  right: 0px;
  .controls-container {
    .change-info {
      .node {
        font-size: 0.8em;
        display: block;
        .time-ago {
          color: #CCC;
        }
      }
    }
    padding: 15px;
    background-color: white;
    box-shadow: 0px -7px 10px -4px rgba(0, 0, 0, 0.1);
  }
  #saveButton {
    float: right;
  }
}

</style>
