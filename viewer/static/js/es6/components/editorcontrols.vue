<script>
import * as _ from 'lodash';

export default {
  props: {
    status,
  },
  methods: {
    save() {
      this.$dispatch('save-item');
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
          <span>Skapad: {{status.created}}</span>
          <span>Ändrad: {{status.modified}}</span>
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
