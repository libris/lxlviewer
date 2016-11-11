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
      // Is @id present?
      if (typeof this.item !== 'undefined' && this.item['@id']) {
        return true;
      } else {
        return false;
      }
    },
    isTyped() {
      // Is @type present?
      if (typeof this.item !== 'undefined' && this.item['@type']) {
        return true;
      } else {
        return false;
      }
    },
    isEmbedded() {
      // Is the type of the item derived from StructuredValue?
      if (!this.isTyped) {
        return false;
      }
      const embeddedTypes = ['StructuredValue', 'ProvisionActivity', 'Contribution'];
      const type = vocabUtil.getBaseClasses(this.item['@type'], this.vocab, this.settings.vocabPfx);
      for (let i = 0; i < embeddedTypes.length; i++) {
        if (~type.indexOf(`${this.settings.vocabPfx}${embeddedTypes[i]}`)) {
          return true;
        }
      }
      return false;
    },
    isEmpty() {
      // TODO: Is the item empty?
      return false;
    },
    getRange() {
      const types = vocabUtil.getRange(this.key, this.vocab, this.settings.vocabPfx);
      return types;
    },
  },
  methods: {
    expand() {
      // Show form
      this.expanded = true;
    },
    collapse() {
      // Hide form
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
      // Sets the focused object (this.item) to an object of the type specified.
      // Also adds all available properties.
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
    <div class="entity-chip" v-if="!isEmbedded" v-bind:class="{ 'linked': isLinked, 'locked': isLocked }">
      <span class="chip-label"><processed-label :item="item"></processed-label></span>
      <i class="chip-action fa fa-pencil" v-on:click="expand" v-if="!isLocked && !isLinked"></i>
      <i class="chip-action fa fa-times" v-on:click="removeThis" v-if="!isLocked && isLinked"></i>
    </div>
    <div class="entity-form" v-if="!isTyped && !isLinked && !isEmbedded">
      <button v-for="type in getRange" v-on:click="setType(type)">{{type}}</button>
    </div>
    <div class="entity-form" v-if="isTyped && !isLinked && !isEmbedded">
      <strong>{{item['@type'] | labelByLang | capitalize}}</strong>
      <div class="entity-form-row" v-for="(k,v) in item" v-if="k.indexOf('@') == -1">
        <span class="entity-form-label">{{k | labelByLang | capitalize}}</span>
        <input v-model="v"></input>
      </div>
      <button v-on:click="removeThis"><i class="chip-action fa fa-trash"></i> Ta bort</button>
      <button v-on:click="collapse" v-bind:disabled="isEmpty"><i class="chip-action fa fa-check"></i> Klar</button>
    </div>
    <div class="entity-structured" v-if="isEmbedded">
      <ul>
        <li v-for="(k,v) in item" v-if="k.indexOf('@') == -1">{{k}}: {{v}}</li>
      </ul>
    </div>
  </div>
</template>

<style lang="less">
// Variables
@chipColor: #e4e4e4;
@chipColorLinked: #71b1aa;
@chipTextColor: rgba(0,0,0,0.6);

.entity-container {
  display: inline-block;
  margin: 0px 2px 2px 0px;
  .entity-chip {
    height: 1.7em;
    padding: 0px 0.2em 0px 0.5em;
    border-radius: 1em;
    color: @chipTextColor;
    background-color: @chipColor;
    border: 0px;
    box-shadow: inset 0px -2px darken(@chipColor, 10%);
    &.locked {
      padding-right: 0.5em;
    }
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
      box-shadow: inset 0px -2px darken(@chipColorLinked, 10%);
    }
  }
  .entity-form {
    border: 0px solid;
    background-color: darken(@chipColor, 5%);
    border-radius: 1em;
    padding: 5px;
    display: none;
    overflow: hidden;
    .entity-form-label {
      color: #000;
    }
  }
  &.expanded {
    width: 100%;
    .entity-chip {
      display: none;
    }
    .entity-form {
      display: block;
    }
  }
}

</style>
