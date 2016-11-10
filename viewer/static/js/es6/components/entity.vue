<script>
import * as _ from 'lodash';
import * as vocabUtil from '../utils/vocab';
import ProcessedLabel from './processedlabel';
import { getVocabulary, getSettings } from '../vuex/getters';

export default {
  name: 'entity',
  props: {
    item: {},
    key: '',
    index: Number,
    expanded: false,
    isLocked: false,
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
    }
  },
  data: function() {
    return {

    }
  },
  computed: {
    json() {
      return JSON.stringify(this.item);
    },
    isLinked() {
      if (typeof this.item !== 'undefined' && this.item['@id']) {
        return true;
      } else {
        return false;
      }
    },
    isTyped() {
      if (typeof this.item !== 'undefined' && this.item['@type']) {
        return true;
      } else {
        return false;
      }
    },
    isEmpty() {

    },
    availableTypes() {
      const types = vocabUtil.getRange(this.key, this.vocab, this.settings.vocabPfx);
      return types;
    },
  },
  methods: {
    expand() {
      this.expanded = true;
    },
    collapse() {
      this.expanded = false;
    },
    removeThis() {
      const holder = this.$parent.value;
      if (_.isArray(holder)) {
        this.$parent.removeById(this.item['@id']);
      } else if (_.isPlainObject(holder)) {
        this.$parent.removeKey(this.key);
      } else {
        this.$parent.emptyValue();
      }
    },
    setType(type) {
      const newObj = this.item;
      const pfx = this.settings.vocabPfx;
      newObj['@type'] = type;

      const properties = vocabUtil.getPropertiesFromArray(type, this.vocab, this.settings.vocabPfx);
      for (let i = 0; i < properties.length; i++) {
        newObj[properties[i].item['@id'].replace(pfx, '')] = '';
      }

      this.item = Object.assign({}, this.item, newObj);
      this.expand();
    },
    addFocus() {
      this.focused = true;
    },
    removeFocus() {
      this.focused = false;
    },
  },
  components: {
    'processed-label': ProcessedLabel,
  },
};
</script>

<template>
  <div class="entity-container" v-bind:class="{ 'expanded' : expanded || (!isLinked && !isTyped) }">
    <div class="entity-chip" v-bind:class="{ 'linked': isLinked }">
      <span class="chip-label"><processed-label :item="item"></processed-label></span>
      <i class="chip-action fa fa-pencil" v-on:click="expand" v-if="!isLinked"></i>
      <i class="chip-action fa fa-times" v-on:click="removeThis" v-if="isLinked"></i>
    </div>
    <div class="entity-form" v-if="!this.isTyped && !this.isLinked">
      <button v-for="type in availableTypes" v-on:click="setType(type)">{{type}}</button>
    </div>
    <div class="entity-form" v-if="this.isTyped && !this.isLinked">
      <strong>{{item['@type'] | labelByLang | capitalize}}</strong>
      <div class="entity-form-row" v-for="(k,v) in item" v-if="k.indexOf('@') == -1">
        <span class="entity-form-label">{{k | labelByLang | capitalize}}</span>
        <input v-model="v"></input>
      </div>
      <button v-on:click="removeThis"><i class="chip-action fa fa-trash-o"></i> Ta bort</button>
      <button v-on:click="collapse"><i class="chip-action fa fa-floppy-o" v-on:click="collapse"></i> Klar</button>
    </div>
  </div>
</template>

<style lang="less">
// Variables
@chipColor: #e4e4e4;
@chipColorLinked: #009788;
@chipTextColor: rgba(0,0,0,0.6);

.entity-container {
  display: inline-block;
  margin: 0px 2px 2px 0px;
  .entity-chip {
    height: 1.7em;
    padding: 0px 0.2em 0px 0.5em;
    border: 0px solid;
    border-radius: 1em;
    color: @chipTextColor;
    background-color: @chipColor;
    .chip-label {
      float: left;
      display: inline-block;
      max-width: 230px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chip-action {
      float: left;
      padding: 0.25em;
      cursor: pointer;
      color: fadeout(@chipTextColor,20%);
      &:hover {
        color: @chipTextColor;
      }
    }
    &.linked {
      background-color: @chipColorLinked;
    }
  }
  .entity-form {
    border: 0px solid;
    background-color: darken(@chipColor, 5%);
    display: none;
    border-radius: 1em;
    width: 100%;
    padding: 5px;
    .entity-form-label {
      color: #000;
    }
  }
  &.expanded {
    display: block;
    width: 100%;
    height: auto;
    .entity-chip {
      display: none;
    }
    .entity-form {
      display: block;
    }
  }
}

</style>
