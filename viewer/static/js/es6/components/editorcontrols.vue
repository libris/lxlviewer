<script>
import * as _ from 'lodash';
import Notifications from '../components/notifications';
import moment from 'moment';
import * as EditUtil from '../utils/edit';
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
    toggleAdminData() {
      this.showAdminInfo = !this.showAdminInfo;
    },
  },
  data() {
    return {
      showAdminInfo: false,
    };
  },
  computed: {
    getAdminData() {
      return this.editorData.record;
    },
    modified() {
      return {
        date: moment(this.editorData.record.modified).format('lll'),
        timeAgo: moment(this.editorData.record.modified).fromNow(),
        by: '-', // Referencing property like below will not work. TODO: Handle array
      };
    },
    created() {
      return {
        date: moment(this.editorData.record.created).format('lll'),
        timeAgo: moment(this.editorData.record.created).fromNow(),
        by: EditUtil.getLinked(this.editorData.record.assigner['@id'], this.editorData.linked).name,
      };
    },
  },
  components: {
    notifications: Notifications,
  },
};
</script>

<template>
  <div class="editor-controls">
    <div class="admin-info">
      <div class="actions">
        <div class="action">
          <i class="fa fa-info-circle" aria-hidden="true" @click="toggleAdminData()"></i>
          <div class="card-info-container" v-show="showAdminInfo">
            <div class="card-info" v-bind:class="{ 'linked': isLinked}">
              <ul>
                <li v-for="(k, v) in getAdminData">
                  {{k}}: {{v}}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="action" v-on:click="toggleDev()" v-bind:class="{'active': status.isDev}">
          <i class="fa fa-wrench" aria-hidden="true"></i>
        </div>
      </div>
      <div class="admin-node">
        <span v-if="editorData.record.created" class="node">Skapad {{created.date}} <span class="time-ago"> av {{created.by}}</span></span>
      </div>
      <!-- <a id="add-button" v-on:click="">
        <i class="fa fa-plus plus-icon" aria-hidden="true"></i>
        Nytt fält
      </a> -->
      <div class="admin-node">
        <span v-if="editorData.record.modified" class="node"> {{'Ändrad '+modified.date}} <span class="time-ago"> av {{modified.by || 'OKÄND'}}</span></span>
      </div>
      <button id="saveButton" v-on:click="save()">
        <i class="fa fa-fw fa-cog fa-spin" v-show="status.saved.loading"></i>
        <i class="fa fa-fw fa-save" v-show="!status.saved.loading"></i>
        Spara
      </button>
    </div>
  </div>
</template>

<style lang="less">
@import './variables.less';

@background: #547e91;

.editor-controls {
  background-color: @background;
  .admin-info {
    flex-direction: row;
    display: flex;
    align-items: center;
    position: relative; 
    padding: 5px 15px;
    .admin-node {
      flex-grow: 5;
      text-align: center;
      .node {
        font-size: 0.8em;
        vertical-align: middle;
        color: lighten(@background, 40%)
      }
    }
    #saveButton {
      padding: 0px;
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

    .actions {
      .action {
        display: inline-block;
        cursor: pointer;
        .card-info-container {
          position: absolute;
          .card-info {
            cursor: auto;
            background-color: @background;
            max-width: 500px;
            border: 1px solid #999;
            border-bottom-left-radius: 10px;
            border-bottom-right-radius: 10px;
            border-top-right-radius: 10px;
            position: relative;
            left: 3%;
            top: -8px;
            padding: 10px;
            ul {
              list-style: none;
              padding: 0px;
              li {
                span {
                  word-break: break-word;
                }
              }
            }
          }
        }
        &.active {
          i {
            color: @brand-primary;
          }
        }
      }
      i {
        color: lighten(@background, 40%);
      }
    }
  }
}

</style>
