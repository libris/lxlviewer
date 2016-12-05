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
    isWork() {
      return this.status.state === 'work';
    },
    isInstance() {
      return this.status.state === 'it';
    },
  },
  components: {
    notifications: Notifications,
  },
};
</script>

<template>
  <div class="container editor-container">
    <div class="editor-controls" :class="{ 'work-state': isWork, 'instance-state': isInstance }" data-spy="affix" data-offset-top="80">
      <div class="admin-info">
        <div class="actions">
          <div class="action">
            <i class="fa fa-info-circle" aria-hidden="true" @click="toggleAdminData()"></i>
            <div class="card-info-container" v-show="showAdminInfo">
              <div class="card-info" v-bind:class="{ 'linked': isLinked, 'work-state': isWork, 'instance-state': isInstance }">
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
  </div>
</template>

<style lang="less">
@import './variables.less';

  .container {
    padding: 0px;

    .editor-controls {
      &.affix {
          top: 0;
          width: inherit;
          z-index: @header-z;
      }
      &.instance-state {
        background-color: @instance-background;
        color: @instance-text;
      }
      &.work-state {
        background-color: @work-background;
        color: @work-text;
      }
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
          }
        }
        #saveButton {
          padding: 0px;
          flex-grow: 1;
        }

        .actions {
          .action {
            display: inline-block;
            cursor: pointer;
            .card-info-container {
              position: absolute;
              .card-info {
                &.instance-state {
                  background-color: @instance-background;
                  color: @instance-text;
                }
                &.work-state {
                  background-color: @work-background;
                  color: @work-text;
                }
                cursor: auto;
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
        }
      }
    }
  }



</style>
