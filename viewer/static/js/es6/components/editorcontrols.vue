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
    toggleDev() {
      this.$dispatch('toggle-dev');
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
  <div class="editor-controls container-fluid">
    <div class="container">
    <div class="admin-info">
      <div class="info-icon">
        <i class="fa fa-info-circle" aria-hidden="true"></i>
        <i class="fa fa-wrench" aria-hidden="true" v-on:click="toggleDev()"></i>
      </div>
      <div class="admin-node">
        <span v-if="editorData.record.created" class="node">Skapad {{created.date}} <span class="time-ago">({{created.timeAgo}})</span></span>
      </div>
      <!-- <a id="add-button" v-on:click="">
        <i class="fa fa-plus plus-icon" aria-hidden="true"></i>
        Nytt fält
      </a> -->
      <div class="admin-node">
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
  position: fixed;
  bottom: 0px;
  left: 0px;
  right: 0px;
  padding: 0px;
  background-color: white;
  box-shadow: 0px -7px 10px -4px rgba(0, 0, 0, 0.1);
  .admin-info {
    flex-direction: row;
    display: flex;
    align-items: center;
    position: relative;
    padding: 15px;
    .admin-node {
      flex-grow: 5;
      text-align: center;
      .node {
        font-size: 0.8em;
        vertical-align: middle;
        .time-ago {
          color: #CCC;
        }
      }
    }
    #saveButton {
      flex-grow: 1;
    }
    #add-button {
      background-color:#009788;
      -moz-border-radius:28px;
      -webkit-border-radius:28px;
      border-radius:28px;
      border:1px solid #009788;
      display:inline-block;
      cursor:pointer;
      color:#ffffff;
      font-family:Arial;
      font-size:17px;
      padding-right: 10px;
      padding-left: 10px;
      text-decoration:none;
      text-shadow:0px 1px 0px #2f6627;
        .plus-icon {
          vertical-align: middle;
        }
        &:hover {
          background-color:#00ad9c;
        }
        &:active {
          position:relative;
          top:1px;
        }
    }

    .info-icon {
      flex-grow: 4;
    }
  }
}

</style>
